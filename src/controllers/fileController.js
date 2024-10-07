const File = require('../models/file');
const Folder = require('../models/folder');
const s3Service = require('../services/s3Service');
const { getIO } = require('../services/socketService');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

exports.uploadFile = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        try {

            let progress = 0;
            getIO().emit("upload-progress-file", progress);
            
            const { mail } = req.body;
            progress=20;
            getIO().emit("upload-progress-file", progress);
            const result = await s3Service.uploadFileToS3(req.file);

            const fileUrl = `https://demo-bucket-foyr.s3.us-west-1.amazonaws.com/${req.file.originalname}`;
            progress=50;
            getIO().emit("upload-progress-file", progress);
            const file = await File.create({
                name: req.file.originalname,
                url: fileUrl,
                size: req.file.size,
                mail: mail,
                pathref: "file",
            });
            progress=100;
            getIO().emit("upload-progress-file", progress);
            res.status(201).json(file);
        } catch (err) {
            getIO().emit("upload-progress-folder", "");
            res.status(500).json({ error: err.message });
        }
    });
};

exports.updatePathref = async (req, res) => {
    try {
        const { id, from, to, newPathref, toId, fromId, mail } = req.body;

        if (!id || !newPathref) {
            return res.status(400).json({ message: 'File ID and new folder pathref are required.' });
        }
        if (!from || !to) {
            return res.status(400).json({ message: 'from and to are required to Transfer the files.' });
        }

        if (from == "file" && to && to != "file") {
            const file = await File.findById(id);
            file.pathref = to
            if (file) {
                let folder = await Folder.findOne({ _id: toId });
                if (!folder) {

                    await Folder.create({
                        name: newPathref,
                        mail: mail,
                        files: [{ ...file }],
                    });
                } else {
                    await Folder.findOneAndUpdate(
                        { _id: folder._id },
                        { $push: { files: { ...file } } },
                        { new: true }
                    );
                }
                await File.findByIdAndDelete(id);
                return res.status(200).json({ message: 'File Upldated Successfully' });
            }
            else {
                return res.status(404).json({ message: 'File not found.' });
            }
        }
        else if (from && to && from != "file" && to != "file") {

            if (to == from) {
                res.status(404).json({ message: "From Path and To Path Can't be same" });
                return
            }
            let fromfolder = await Folder.findOne({ _id: fromId });
            const fileToMove = fromfolder.files.find((file) => file._id.toString() === id.toString());
            const filesToupdatefrom = fromfolder.files.filter((file) => file._id.toString() !== id.toString());

            fileToMove.pathref = to;
            let newfolder = await Folder.findOne({ _id: toId });
            if (!newfolder) {
                await Folder.create({
                    name: to,
                    mail: mail,
                    files: [{ ...fileToMove }],
                });
            } else {
                await Folder.findOneAndUpdate(
                    { _id: toId },
                    { $push: { files: fileToMove } },
                    { new: true }
                );
            }

            await Folder.findOneAndUpdate(
                { _id: fromId },
                { $set: { files: filesToupdatefrom } },
                { new: true }
            );

            return res.status(200).json({ message: 'File Upldated Successfully' });

        }
        else if (from && to && from != "file" && to == "file") {

            let fromfolder = await Folder.findOne({ _id: fromId });
            const fileToMove = fromfolder.files.find((file) => file._id.toString() === id.toString());
            const filesToupdatefrom = fromfolder.files.filter((file) => file._id.toString() !== id.toString());

            fileToMove.pathref = to
            await File.create(fileToMove);

            await Folder.findOneAndUpdate(
                { _id: fromId },
                { $set: { files: filesToupdatefrom } },
                { new: true }
            );
            return res.status(200).json({ message: 'File Upldated Successfully' });
        }

    } catch (error) {
        console.error('Error moving file to folder:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.redirect(file.url);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const { mail } = req.query;
        const files = await File.find({ mail });
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        // await s3Service.deleteFileFromS3(file.name);
        await File.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

