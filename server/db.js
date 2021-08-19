const Database = require('better-sqlite3');
const fs = require('fs');

function addResource(db, resource) {
    let stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type = '${resource.includes('tbl') ? 'table' : 'view'}' AND name = '${resource}'`);
    const exists = stmt.get();
    if (!exists) {
        stmt = db.prepare(fs.readFileSync(`./server/sql/${resource}.sql`, 'utf8'));
        stmt.run();
    }
}

module.exports = function() {
    return new Promise((resolve, reject) => {
        const createDb = !fs.existsSync('./phish.db');
        const db = new Database('./phish.db');
        
        if (createDb) {
            addResource(db, 'tblShow');
            addResource(db, 'tblArtist');
            addResource(db, 'tblGenre');
            addResource(db, 'tblShowArtist');
            addResource(db, 'tblShowGenre');
            addResource(db, 'tblLink');
            addResource(db, 'tblDownload');
            addResource(db, 'tblCoverArt');
            addResource(db, 'tblLinkMetadata');
            addResource(db, 'tblTrack');
            addResource(db, 'tblTrackArtist');
            addResource(db, 'tblTrackGenre');
            addResource(db, 'vwShowInfo');
            addResource(db, 'vwTrackInfo');
        }
        
        // back up the DB before doing anything
        db.backup('./phish.db.backup').then(() => {
            resolve(db);
        }).catch((err) => {
            console.error(err);
            process.exit();
            reject();
        });
    });
}