const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

cron.schedule('0 * * * *', () => {
  const tempDir = path.join(__dirname, 'temp');
  
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) throw err;
      });
    }
  });

  console.log('Temporary files cleaned');
});
