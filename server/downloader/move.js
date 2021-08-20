var fs = require('fs');

module.exports = function move(oldPath, newPath) {
    return new Promise((resolve) => {
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                if (err.code === 'EXDEV') {
                    var readStream = fs.createReadStream(oldPath);
                    var writeStream = fs.createWriteStream(newPath);
            
                    readStream.on('error', () => resolve(false));
                    writeStream.on('error', () => resolve(false));
            
                    readStream.on('close', function () {
                        fs.unlink(oldPath, callback);
                    });
            
                    readStream.pipe(writeStream);
                } else {
                    resolve(false)
                }
            } else resolve(true);
        });
    });
}