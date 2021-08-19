const puppeteer = require('puppeteer');
const got = require('got');
const fs = require('fs');

class DataCollector {
    constructor(db) {
        this.db = db;
        this.interval = null;
        this.progressData = {
            current: 0,
            total: 0,
            percent: 0,
            status: 'Not Doing Anything'
        };
    }
    
    start () {
        if (this.interval) return;
        this.interval = setInterval(this.scrape.bind(this), 86400 * 1000);
        console.log('Data collector started');
        this.scrape();
    }
    
    stop () {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
        console.log('Data collector stopped');
    }
    
    progress (data) {
        this.progressData = data;
        console.log(data);
    }
    
    checkCoverArtTable () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tblCoverArt'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/tblCoverArt.sql', 'utf8'));
            stmt.run();
        }
    }
    
    checkShowTable () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tblShow'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/tblShow.sql', 'utf8'));
            stmt.run();
        }
    }
    
    checkLinkTable () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tblLink'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/tblLink.sql', 'utf8'));
            stmt.run();
            
            stmt = this.db.prepare('ALTER TABLE tblCoverArt ADD CONSTRAINT fk_link_id FOREIGN KEY (link_id) REFERENCES tblLink(id)');
            stmt.run();
        }
    }
    
    checkDownloadTable () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tblDownload'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/tblDownload.sql', 'utf8'));
            stmt.run();
        }
    }

    checkShowView () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'view' AND name = 'vwShowInfo'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/vwShowInfo.sql', 'utf8'));
            stmt.run();
        }
    }

    checkTrackView () {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'view' AND name = 'vwTrackInfo'`);
        const exists = stmt.get();
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync('./server/sql/vwTrackInfo.sql', 'utf8'));
            stmt.run();
        }
    }
    
    fileNameFromUrl (url) {
        const matches = url.match(/\/([^\/?#]+)[^\/]*$/);
        let out = null;
        if (!matches) {
            console.log('No filename found in url', url);
            return null;
        } else if (matches.length > 1) out = matches[1];
        
        // Some of these URLs are encoded multiple times,
        // probably only ever twice, but I want to be safe
        while(out.indexOf('%') !== -1) out = decodeURIComponent(out);
        while(out.indexOf('_') !== -1) out = out.replace('_', ' ');
        
        if (out[out.length - 1] === '\\') out = out.substr(0, out.length - 1);
        
        return out;
    };
    
    async scrape () {
        try {
            this.progress({ current: 0, total: 1, percent: 0, status: 'Scraping spreadsheet' });
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            page.on("pageerror", function(err) { console.log("Page error: " + err.toString()); });
            page.on("error", function(err) { console.log("Page error: " + err.toString()); });
            await page.goto('https://docs.google.com/spreadsheets/d/1yAXu83gJBz08cW5OXoqNuN1IbvDXD2vCrDKj4zn1qmU/pubhtml#');
            await page.screenshot({ path: 'last_scrape_frame.png' });
            const result = await new Promise(async (resolve, reject) => {
                const code = fs.readFileSync('./server/collection/puppet.js', 'utf8');
                await page.exposeFunction('send_result', resolve);
                await page.evaluate(code);
            });
            fs.writeFileSync('./last_scrape.json', JSON.stringify(result));
            await browser.close();
            this.progress({ current: 1, total: 1, percent: 100, status: 'Finished scraping spreadsheet' });
            if (result.error) console.error(`Failed to acquire spreadsheet data:\n${result.error}`);
            else this.process_links(result.data);
        } catch (err) {
            console.log(err);
        }
    }
    
    async get_mediafire_folder_data (url) {
        const isMediafire = url.includes('mediafire');
        if (isMediafire) {
            // This is a link to a mediafire directory
            // let's see if we can get the links to those crunchy grooves
            const folder_key = url === 'http://www.mediafire.com/the-daily-ghost' ? 'fh199xm7ss2b1' : url.substr(url.indexOf('?') + 1);
            const data = await got(
                `http://www.mediafire.com/api/1.4/folder/get_content.php?r=nvae&content_type=files&folder_key=${folder_key}&response_format=json`,
                { responseType: 'json', resolveBodyOnly: true }
            );
            return data;
        } else throw 'Unrecognized link';
    }
    
    async resolve_links (links) {
        if (links.length === 0) return { resolved: [], unresolved: [] };
        const wait = ms => new Promise ((rs, rj) => { setTimeout(() => { rs(); }, ms); });
        const resolved = [];
        const unresolved = [];
        const length = links.length;
        for (let i = 0;i < length;i++) {
            const link = links[i];
            try {
                this.progress({
                    current: i,
                    total: length,
                    percent: i / length * 100,
                    status: 'Acquiring mediafire folder item URLs'
                });
                let data = null;
                try {
                    data = await this.get_mediafire_folder_data(link.url);
                } catch (err) {
                    console.error(data);
                    unresolved.push(link);
                    continue;
                }
                
                let count = 0;
                if (data.response && data.response.folder_content && data.response.folder_content.files) {
                    data.response.folder_content.files.forEach(file => {
                        if (file.links && file.links.normal_download) {
                            let url = file.links.normal_download;
                            if (url.substr(url.length - 5) === '/file') url = url.substr(0, url.length - 5);
                            link.folder_links.push({
                                filename: file.filename,
                                url
                            });
                        } else {
                            throw 'Unexpected file object structure, What the fuck is this?';
                        }
                    });
                    resolved.push(link);
                    
                    link.resolve_status = `Resolved. Found ${count} actual link${count === 1 ? '' : 's'}`;
                } else {
                    link.resolve_status = `Resolved, but found no files`;
                    
                    //whatever
                    unresolved.push(link);
                }
            } catch (err) {
                link.resolve_status = `Error: ${err}`;
                unresolved.push(link);
            }
        }
        this.progress({ current: length, total: length, percent: 100, status: 'Acquiring mediafire folder item URLs' });
        return { resolved, unresolved };
    }
    
    async process_links (linkCollections) {
        const existing = this.db.prepare('SELECT url FROM tblLink').all();
        const notExistingFilter = l => !existing.find(r => r.url === l.url);
        
        const links = linkCollections.mediafire_good.filter(notExistingFilter);
        const newFolders = linkCollections.mediafire_folders.filter(notExistingFilter);
        const mediafire_folder_results = await this.resolve_links(newFolders);
        mediafire_folder_results.resolved.forEach(l => { links.push(l); });
        mediafire_folder_results.unresolved.forEach(l => { l.invalid = true; links.push(l); });
        
        linkCollections.mega.filter(notExistingFilter).forEach(l => {
            l.invalid = true;
            links.push(l);
        });
        linkCollections.soundcloud.filter(notExistingFilter).forEach(l => {
            l.invalid = true;
            links.push(l);
        });
        linkCollections.other.filter(notExistingFilter).forEach(l => {
            l.invalid = true;
            links.push(l);
        });
        
        links.forEach((link, idx) => {
            this.progress({
                current: idx,
                total: links.length,
                percent: (idx / links.length) * 100,
                status: 'Storing new spreadsheet data in DB'
            });
            this.db.transaction(() => {
                let isCoverArt = false;
                if (this.fileNameFromUrl(link.url).toLowerCase().includes('cover')) isCoverArt = true;
                else isCoverArt = link.folder_links.some(l => this.fileNameFromUrl(link.url).toLowerCase().includes('cover'));
                
                if (isCoverArt) {
                    let stmt = this.db.prepare(`INSERT INTO tblLink (url, is_valid, is_folder) VALUES (?, ?, ?)`);
                    stmt.run(link.url, link.invalid ? 0 : 1, link.folder_links.length > 0 ? 1 : 0);
                    link.folder_links.forEach(l => {
                        stmt = this.db.prepare(`INSERT INTO tblLink (url, is_valid, is_folder) VALUES (?, ?, ?)`);
                        stmt.run(l.url, 1, 0);
                    });
                } else {
                    let stmt = this.db.prepare(`INSERT INTO tblShow (date, date_str, raw_data, city, state, venue, source, notes, is_sbd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    const date = new Date(link.metadata.date.toLowerCase().replace('xx', '01').replace('xx', '01'));
                    const info = stmt.run(
                        date == 'Invalid Date' ? null : date.getTime(),
                        link.metadata.date,
                        JSON.stringify(link.metadata),
                        link.metadata.city || null,
                        link.metadata.state || null,
                        link.metadata.venue || null,
                        link.metadata.source || null,
                        link.metadata.notes || null,
                        link.metadata.sbd.toLowerCase().trim() === 'x' ? 1 : 0
                    );
                    const showId = info.lastInsertRowid;
                    stmt = this.db.prepare(`INSERT INTO tblLink (show_id, url, is_valid, is_folder) VALUES (?, ?, ?, ?)`);
                    stmt.run(showId, link.url, link.invalid ? 0 : 1, link.folder_links.length > 0 ? 1 : 0);
                    link.folder_links.forEach(l => {
                        stmt = this.db.prepare(`INSERT INTO tblLink (show_id, url, is_valid, is_folder) VALUES (?, ?, ?, ?)`);
                        stmt.run(showId, l.url, 1, 0);
                    });
                }
            })();
        });
        
        await this.db.backup('./phish.db.backup');
    }
};

module.exports = DataCollector;
