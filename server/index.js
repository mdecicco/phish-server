const http = require('http');
const fs = require('fs');
const Database = require('better-sqlite3');
const Route = require('./router');
const api = require('./api');
const DataCollector = require('./collection');
const Downloader = require('./downloader');

const rootRoute = {
    get: (args) => {
        const { response, pathParams } = args;
        console.log(pathParams);
        if (pathParams.file === '') {
            response.setHeader('Content-Type', 'text/html');
            fs.createReadStream('./dist/index.html').pipe(response);
        } else if (pathParams.file === 'app.js') {
            response.setHeader('Content-Type', 'application/javascript');
            fs.createReadStream('./dist/app.js').pipe(response);
        } else if (pathParams.file === 'favicon.ico') {
            response.setHeader('Content-Type', 'image/x-icon');
            fs.createReadStream('./dist/favicon.ico').pipe(response);
        }
    }
};

const htmlRoute = {
    get: (args) => {
        const { response } = args;
        response.setHeader('Content-Type', 'text/html');
        fs.createReadStream('./dist/index.html').pipe(response);
    }
};

const root = new Route(null, null, rootRoute);
root.addSubRoute(':file', rootRoute);
root.addSubRoute('shows/:show_id', htmlRoute);
root.addSubRoute('queue', htmlRoute);
root.addSubRoute('tracks', htmlRoute);

const db = new Database('./phish.db');
const collector = new DataCollector(db);
const downloader = new Downloader(db);

api.bind(root, db, collector, downloader);
db.backup('./phish.db.backup').then(() => {
    collector.start();
    downloader.start();
}).catch((err) => {
    console.error(err);
    process.exit();
});

let backupTimeout = null;
const backup = () => {
    console.log('Backing up DB');
    db.backup('./phish.db.backup').then(() => {
        console.log('Successfully backed up DB');
    }).catch((err) => {
        console.log('Error backing up DB\n', err);
    });
    
    backupTimeout = setTimeout(backup, 20 * 60 * 1000);
};
backupTimeout = setTimeout(backup, 20 * 60 * 1000);

const server = http.createServer((request, response) => {
    root.onRequest(request, response);
});

server.on('close', () => {
    console.log('\nStopping server and closing DB connections...');
    if (backupTimeout) clearTimeout(backupTimeout);
    collector.stop();
    downloader.stop();
    db.close();
    process.exit();
});

const port = 6169;
server.listen(port, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`Server is listening on ${port}`);
});

var closed = false;
process.on('exit', () => { if (closed) return; closed = true; console.log('Closing server...'); server.close(); });
process.on('SIGHUP', () => { if (closed) return; closed = true; console.log('Closing server...'); server.close(); });
process.on('SIGINT', () => { if (closed) return; closed = true; console.log('Closing server...'); server.close(); });
process.on('SIGTERM', () => { if (closed) return; closed = true; console.log('Closing server...'); server.close(); });
