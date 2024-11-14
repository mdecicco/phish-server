const http = require('http');
const fs = require('fs');
const openDb = require('./db');
const Route = require('./router');
const api = require('./api');
const DataCollector = require('./collection');
const Downloader = require('./downloader');

const port = 6169;
let backupTimeout = null;

function setupRoutes () {
    const rootRoute = {
        get: (args) => {
            const { response, pathParams } = args;
            console.log(pathParams);
            if (pathParams.file === '') {
                const file = './dist/index.html';
                const stat = fs.statSync(file);
                response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': stat.size });
                fs.createReadStream(file).pipe(response, { end: true });
            } else if (/bundle.([0-9a-fA-F]{20}).js/g.test(pathParams.file)) {
                const file = `./dist/${pathParams.file}`;
                const stat = fs.statSync(file);
                response.writeHead(200, { 'Content-Type': 'application/javascript' });
                fs.createReadStream(file, { bufferSize: 64 * 1024 }).pipe(response, { end: true });
            } else if (pathParams.file === 'favicon.ico') {
                const file = './static/favicon.ico';
                const stat = fs.statSync(file);
                response.writeHead(200, { 'Content-Type': 'image/x-icon', 'Content-Length': stat.size });
                fs.createReadStream(file).pipe(response, { end: true });
            }
        }
    };
    
    const htmlRoute = {
        get: (args) => {
            const { response } = args;
            const file = './dist/index.html';
            const stat = fs.statSync(file);
            response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': stat.size });
            fs.createReadStream(file).pipe(response, { end: true });
        }
    };
    
    const root = new Route(null, null, rootRoute);
    root.addSubRoute(':file', rootRoute);
    root.addSubRoute('shows/:show_id', htmlRoute);
    root.addSubRoute('queue', htmlRoute);
    root.addSubRoute('tracks', htmlRoute);

    return root;
}

function startBackupInterval (db) {
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
}

function startServer (db) {
    startBackupInterval(db);

    const collector = new DataCollector(db);
    const downloader = new Downloader(db);
    collector.start();
    downloader.start();

    const router = setupRoutes();
    api.bind(router, db, collector, downloader);

    const server = http.createServer((request, response) => {
        router.onRequest(request, response);
    });

    server.on('close', () => {
        console.log('\nStopping server and closing DB connections...');
        collector.stop();
        downloader.stop();
        clearTimeout(backupTimeout);
        db.close();
        process.exit();
    });

    let closed = false;
    const closeServer = () => {
        if (closed) return;
        closed = true;
        console.log('Closing server...');
        server.close();
    };
    
    server.listen(port, (err) => {
        if (err) {
            console.log(err);
            closeServer();
            return;
        }
        console.log(`Server is listening on ${port}`);
    });

    process.on('exit', closeServer);
    process.on('SIGHUP', closeServer);
    process.on('SIGINT', closeServer);
    process.on('SIGTERM', closeServer);

    return server;
}

openDb().then(db => {
    startServer(db);
});