const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: String,
    url: String,
    size: Number,
    files:Array,
    mail:String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);
