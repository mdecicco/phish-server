const fs = require('fs');
const http = require('http');
const https = require('https');
const child_process = require('child_process');
const path = require('path');
const mm = require('music-metadata');

class Downloader {
    constructor(db) {
        this.db = db;
        this.interval = null;
        this.downloading = [];
        this.extracting = [];
        this.maxConcurrentDownloads = 5;
    }
    
    start () {
        if (this.interval) return;
        this.interval = setInterval(this.check.bind(this), 1 * 1000);
        console.log('Downloader started');
        this.check();
    }
    
    stop () {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
        console.log('Downloader stopped');
    }
    
    checkTable (table) {
        let stmt = this.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`);
        const exists = stmt.get(table);
        if (!exists) {
            stmt = this.db.prepare(fs.readFileSync(`./server/sql/${table}.sql`, 'utf8'));
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
        while (out.indexOf('%') !== -1) out = decodeURIComponent(out);
        while (out.indexOf('_') !== -1) out = out.replace('_', ' ');
        while (out.indexOf('*') !== -1) out = out.replace('*', '_');
        
        if (out[out.length - 1] === '\\') out = out.substr(0, out.length - 1);
        
        return out;
    };
    
    extractDateStr (d) {
        let day = null;
        let month = null;
        let year = null;
        
        let result = d.match("[0-9]{2}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{4}");
        if (result) {
            const dateSplitted = result[0].split(result[1]);
            day = dateSplitted[0];
            month = dateSplitted[1];
            year = dateSplitted[2];
        }
        
        result = d.match("[0-9]{4}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{2}");
        if (result) {
            const dateSplitted = result[0].split(result[1]);
            day = dateSplitted[2];
            month = dateSplitted[1];
            year = dateSplitted[0];
        }

        if (month > 12) {
            const aux = day;
            day = month;
            month = aux;
        }
        
        return `${year}-${month}-${day}`;
    }
    
    handleResponse (download, response, resolve) {
        response.pipe(download.stream);
        
        const length = parseInt(response.headers['content-length'], 10);
        let current = 0;
        
        response.on('data', (chunk) => {
            current += chunk.length;
            download.progress = {
                current,
                total: length,
                percent: (current / length) * 100,
                status: 'Downloading'
            };
        });
    
        response.on('end', () => {
            download.stream.close();
            download.progress = {
                current: length,
                total: length,
                percent: 100,
                status: 'Finished'
            };
            resolve({ status: 'success' });
        });
        
        response.on('error', (error) => {
            download.stream.close();
            fs.unlinkSync(download.file_path);
            resolve({ status: 'error', error: error.toString() });
        });
    }
    
    addShowToDb (download, albumData, fileName) {
        console.log(`Updating DB with data from ${fileName}`);
        this.db.transaction(() => {
            const showArtistIds = [];
            const showGenreIds = [];
            let coverArtId = null;
            
            const existingShowArtists = this.db.prepare('SELECT artist_id FROM tblShowArtist WHERE show_id = ?').all(download.show_id);
            existingShowArtists.forEach(a => { showArtistIds.push(a.artist_id); });
            const existingShowGenres = this.db.prepare('SELECT genre_id FROM tblShowGenre WHERE show_id = ?').all(download.show_id);
            existingShowGenres.forEach(g => { showGenreIds.push(g.genre_id); });
            
            if (albumData.artwork && !coverArtId) {
                const show = this.db.prepare('SELECT date FROM tblShow WHERE id = ?').get(download.show_id);
                const info = this.db.prepare('INSERT INTO tblCoverArt (link_id, date, file_path) VALUES (?, ?, ?)').run(download.link_id, show.date, albumData.artwork);
                coverArtId = info.lastInsertRowid;
            }
            
            if (!coverArtId) {
                const show = this.db.prepare('SELECT date FROM tblShow WHERE id = ?').get(download.show_id);
                const art = this.db.prepare('SELECT id FROM tblCoverArt WHERE date = ?').get(show.date);
                if (art) coverArtId = art.id;
            }
            
            albumData.tracks.forEach((track, idx) => {
                let trackIndex = idx + 1;
                let trackTitle = path.basename(track.file);
                let trackBitRate = null;
                let trackDuration = null;
                let trackSampleRate = null;
                let trackChannels = null;
                let trackLossless = 0;
                let trackCodec = null;
                let trackCodecProfile = null;
                let trackNote = null;
                let trackArtists = [];
                let trackGenres = [];
                
                if (track.format) {
                    if (track.format.duration) trackDuration = parseFloat(track.format.duration);
                    if (track.format.bitrate) trackBitRate = parseFloat(track.format.bitrate);
                    if (track.format.sampleRate) trackSampleRate = parseFloat(track.format.sampleRate);
                    if (track.format.numberOfChannels) trackChannels = parseInt(track.format.numberOfChannels, 10);
                    if (track.format.lossless) trackLossless = 1;
                    if (track.format.codec) trackCodec = track.format.codec;
                    if (track.format.codecProfile) trackCodecProfile = track.format.codecProfile;
                }
                
                if (track.info) {
                    if (track.info.track && track.info.track.no) trackIndex = parseInt(track.info.track.no, 10);
                    if (track.info.title) trackTitle = track.info.title;
                    if (track.info.artists && track.info.artists.length > 0) trackArtists = track.info.artists;
                    if (track.info.genre && track.info.genre.length > 0) trackGenres = track.info.genre;
                    if (track.info.comment) trackNote = track.info.comment;
                }
                
                let info = null;
                info = this.db.prepare(`
                    INSERT INTO tblTrack (
                        show_id,
                        link_id,
                        cover_art_id,
                        track_index,
                        title,
                        bit_rate,
                        duration,
                        sample_rate,
                        channels,
                        lossless,
                        codec,
                        codec_profile,
                        note,
                        file_path
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    download.show_id,
                    download.link_id,
                    coverArtId,
                    trackIndex,
                    trackTitle,
                    trackBitRate,
                    trackDuration,
                    trackSampleRate,
                    trackChannels,
                    trackLossless,
                    trackCodec,
                    trackCodecProfile,
                    trackNote,
                    track.file
                );
                
                const trackId = info.lastInsertRowid;
                
                trackArtists.forEach(artist => {
                    let artistId = null;
                    const existing = this.db.prepare('SELECT * FROM tblArtist WHERE LOWER(LTRIM(RTRIM(name))) = ?').get(artist.trim().toLowerCase());
                    if (existing) artistId = existing.id;
                    else {
                        info = this.db.prepare('INSERT INTO tblArtist (name) VALUES (?)').run(artist);
                        artistId = info.lastInsertRowid;
                    }
                    
                    this.db.prepare('INSERT INTO tblTrackArtist (track_id, artist_id) VALUES (?, ?)').run(trackId, artistId);
                    if (!showArtistIds.includes(artistId)) showArtistIds.push(artistId);
                });
                
                trackGenres.forEach(genre => {
                    let genreId = null;
                    const existing = this.db.prepare('SELECT * FROM tblGenre WHERE LOWER(LTRIM(RTRIM(name))) = ?').get(genre.trim().toLowerCase());
                    if (existing) genreId = existing.id;
                    else {
                        info = this.db.prepare('INSERT INTO tblGenre (name) VALUES (?)').run(genre);
                        genreId = info.lastInsertRowid;
                    }
                    
                    this.db.prepare('INSERT INTO tblTrackGenre (track_id, genre_id) VALUES (?, ?)').run(trackId, genreId);
                    if (!showGenreIds.includes(genreId)) showGenreIds.push(genreId);
                });
            });
            
            showArtistIds.forEach(id => {
                this.db.prepare('INSERT INTO tblShowArtist (show_id, artist_id) VALUES (?, ?)').run(download.show_id, id);
            });
            
            showGenreIds.forEach(id => {
                this.db.prepare('INSERT INTO tblShowGenre (show_id, genre_id) VALUES (?, ?)').run(download.show_id, id);
            });
            
            if (albumData.dotNetInfo && albumData.dotNetInfo.length === 1) {
                const show = this.db.prepare('SELECT pdn_id FROM tblShow WHERE id = ?').get(download.show_id);
                if (show && !show.pdn_id) {
                    const pdn_id = albumData.dotNetInfo[0].showid;
                    this.db.prepare('UPDATE tblShow SET pdn_id = ? WHERE id = ?').run(pdn_id, download.show_id);
                }
            }
        })();
        console.log(`Successfully acquired ${fileName}`);
    }
    
    async acquirePhishDotNetData (download, albumData) {
        let date = null;
        if (albumData.title) this.extractDateStr(albumData.title);
        else {
            const show = this.db.prepare("SELECT date FROM tblShow WHERE id = ?").get(download.show_id);
            if (show && show.date) date = (new Date(show.date)).toISOString().split('T')[0];
        }
        if (!date) return null;
        
        const result = await new Promise((resolve, reject) => {
            const url = `https://api.phish.net/v3/setlists/get?showdate=${encodeURIComponent(date)}&apikey=${process.env.PDN_API_KEY}`;
            https.get(url, (resp) => {
                let data = '';
                resp.on('data', (chunk) => { data += chunk; });
                resp.on('end', () => {
                    try {
                        resolve(JSON.parse(data).response.data);
                    } catch (error) {
                        console.log(`Failed to get PDN data for ${date}`);
                        console.log(error);
                        resolve(null);
                    }
                });
            }).on("error", (error) => {
                console.log(`Failed to get PDN data for ${date}`);
                console.log(error);
                resolve(null);
            });
        });
        
        return result;
    }
    
    async processMetadata (download, trackMetadata, dir, fileName) {
        console.log(`Processing tracks from ${fileName}`);
        const albumData = {
            id: download.show_id,
            title: null,
            tracks: [],
            artwork: null,
            dotNetInfo: null
        };
        
        trackMetadata.forEach(track => {
            if (track.error) {
                albumData.tracks.push({
                    file: track.file,
                    format: null,
                    info: null,
                    error: track.error
                });
            } else {
                if (!albumData.title && track.metadata.common.album) albumData.title = track.metadata.common.album;
                if (!albumData.artwork && track.metadata.common.picture) albumData.artwork = track.metadata.common.picture;
                
                albumData.tracks.push({
                    file: track.file,
                    format: track.metadata.format,
                    info: track.metadata.common,
                    error: null
                });
            }
        });
        
        if (albumData.artwork && albumData.artwork.length > 0) {
            const format = albumData.artwork[0].format.split('/')[1];
            const fileName = `${dir}cover.${format}`;
            const fd = fs.createWriteStream(fileName);
            fd.write(Buffer.from(albumData.artwork[0].data.buffer));
            fd.end();
            albumData.artwork = fileName;
        }
        
        albumData.dotNetInfo = await this.acquirePhishDotNetData(download, albumData);
        
        this.addShowToDb(download, albumData, fileName);
    }
    
    processCoverArt (download, dir) {
        const files = fs.readdirSync(dir);
        
        for (let idx = 0;idx < files.length;idx++) {
            const f = files[idx];
            const filePath = `${dir}${f}`;
            let date = new Date(this.extractDateStr(f));
            if (date == 'Invalid Date') date = null;
            else date = date.getTime();
            
            const info = this.db.prepare('INSERT INTO tblCoverArt (link_id, date, file_path) VALUES (?, ?, ?)').run(download.link_id, date, filePath);
            const coverArtId = info.lastInsertRowid;
            
            if (date) {
                this.db.prepare(`
                    UPDATE tblTrack
                    SET cover_art_id = ?
                    WHERE
                        EXISTS (
                            SELECT id
                            FROM tblShow
                            WHERE
                                date = ?
                                AND tblShow.id = tblTrack.show_id
                        )
                        AND cover_art_id IS NULL
                `).run(coverArtId, date);
            }
        }
        
        console.log('Successfully processed cover art');
    }
    
    async processExtracted (download, dir, fileName) {
        console.log(`Extracted ${fileName}`);
        download.progress = {
            current: 0,
            total: 1,
            percent: 0,
            status: 'Processing'
        };
        try {
            if (download.file_path.toLowerCase().includes('cover')) this.processCoverArt(download, dir);
            else {
                const files = fs.readdirSync(dir);
                const trackMetadata = [];
                
                for (let idx = 0;idx < files.length;idx++) {
                    const f = files[idx];
                    const filePath = `${dir}${f}`;
                    try {
                        if (filePath.toLowerCase().includes('.txt')) {
                            this.db.prepare('INSERT INTO tblLinkMetadata (link_id, show_id, file_path) VALUES (?, ?, ?)').run(download.link_id, download.show_id, filePath);
                            continue;
                        }
                        
                        let metadata = await mm.parseFile(filePath, { native: true });
                        trackMetadata.push({
                            file: filePath,
                            metadata,
                            error: null
                        });
                    } catch (err) {
                        trackMetadata.push({
                            file: filePath,
                            metadata: null,
                            error: err
                        });
                    }
                }
                
                await this.processMetadata(download, trackMetadata, dir, fileName);
            }
            this.db.prepare(`UPDATE tblDownload SET is_extracted = 1 WHERE id = ?`).run(download.id);
            fs.unlinkSync(download.file_path);
        } catch (err) {
            console.log(`Failed to process ${fileName}`);
            console.log(err);
            this.db.prepare(`UPDATE tblDownload SET extract_error = ? WHERE id = ?`).run(err, download.id);
        }
    }
    
    async extract (download) {
        if (this.extracting.find(e => e.id === download.id)) return;
        
        this.extracting.push(download);
        download.progress = {
            current: 0,
            total: 1,
            percent: 0,
            status: 'Extracting'
        };
        
        const fileName = path.basename(download.file_path);
        const dirName = fileName.substr(0, fileName.lastIndexOf('.'));
        const dirPath = `/media/storage3/media/Music/phish/${dirName}/`;
        console.log(`Extracting ${fileName}`);
        await new Promise((resolve, reject) => {
            child_process.exec(`unrar x -o+ "${download.file_path}" "${dirPath}"`, async (err, out) => {
                if (err) {
                    console.log(`\n\nExtracting ${fileName} failed`);
                    console.log(out);
                    console.log('\n\n');
                    this.db.prepare(`UPDATE tblDownload SET extract_error = ? WHERE id = ?`).run(out, download.id);
                    this.extracting = this.extracting.filter(e => e.id !== download.id);
                } else {
                    await this.processExtracted(download, dirPath, fileName);
                    this.extracting = this.extracting.filter(e => e.id !== download.id);
                }
                resolve();
            });
        });
    }
    
    async check () {
        if (this.downloading.length === this.maxConcurrentDownloads) return;
        this.checkTable('tblDownload');
        this.checkTable('tblLinkMetadata');
        this.checkTable('tblTrack');
        this.checkTable('tblArtist');
        this.checkTable('tblTrackArtist');
        this.checkTable('tblShowArtist');
        this.checkTable('tblGenre');
        this.checkTable('tblTrackGenre');
        this.checkTable('tblShowGenre');
        
        const activeIds = [];
        this.downloading.forEach(d => {
            if (!activeIds.includes(d.id)) activeIds.push(d.id);
        });
        this.extracting.forEach(d => {
            if (!activeIds.includes(d.id)) activeIds.push(d.id);
        });
        
        let availableSlots = this.maxConcurrentDownloads - this.downloading.length;
        try {
            // get downloads that were interrupted
            const interrupted = this.db.prepare(`
                SELECT d.*, l.url
                FROM tblDownload AS d
                LEFT OUTER JOIN tblLink AS l ON l.id = d.link_id
                WHERE
                    d.is_downloaded = 0
                    AND d.download_error IS NULL
                    AND d.extract_error IS NULL
                    ${activeIds.length > 0 ? `AND d.id NOT IN (${activeIds.join(',')})` : ''}
                LIMIT ?
            `).all(availableSlots);
            const downloads = interrupted;
            if (interrupted.length > 0 && downloads.some(d => activeIds.includes(d.id))) {
                console.log('\n\n\n\nThis should never happen');
                console.log('Active downloads', activeIds);
                console.log('New downloads', downloads.map(d => d.id));
                console.log('\n\n\n\n');
            }
            availableSlots -= downloads.length;
            
            // get downloads that haven't started yet
            if (availableSlots > 0) {
                const uninitialized = this.db.prepare(`
                    SELECT
                        id,
                        show_id,
                        url
                    FROM tblLink
                    WHERE
                        id NOT IN (SELECT link_id FROM tblDownload)
                        AND is_folder = 0
                        AND is_valid = 1
                    LIMIT ?
                `).all(availableSlots);
                
                // submit them to tblDownload
                uninitialized.forEach(l => {
                    const filename = this.fileNameFromUrl(l.url);
                    this.db.transaction(() => {
                        let stmt = this.db.prepare(`INSERT INTO tblDownload (show_id, link_id, file_path) VALUES (?, ?, ?)`);
                        const info = stmt.run(
                            l.show_id,
                            l.id,
                            `/media/storage3/downloads/phish/${(new Date()).getTime()}_${filename}`
                        );
                        const downloadId = info.lastInsertRowid;
                        const download = this.db.prepare(`
                            SELECT d.*, l.url
                            FROM tblDownload AS d
                            LEFT OUTER JOIN tblLink AS l ON l.id = d.link_id
                            WHERE d.id = ?
                        `).get(downloadId);
                        downloads.push(download);
                    })();
                });
            }
            
            downloads.forEach(d => {
                d.progress = {
                    current: 0,
                    total: 0,
                    percent: 0,
                    status: 'Downloading'
                };
                const complete = (data) => {
                    if (data.status === 'error') {
                        console.log(`Download '${d.url}' failed`);
                        this.db.prepare(`UPDATE tblDownload SET download_error = ? WHERE id = ?`).run(data.error, d.id);
                    } else {
                        this.db.prepare(`UPDATE tblDownload SET download_error = NULL, finished_on = CURRENT_TIMESTAMP, is_downloaded = 1 WHERE id = ?`).run(d.id);
                        this.extract(d);
                        this.downloading = this.downloading.filter(e => e.id !== d.id);
                    }
                };
                this.db.prepare(`UPDATE tblDownload SET attempts = attempts + 1 WHERE id = ?`).run(d.id);
                console.log(`Downloading '${d.url}'`);
                d.stream = fs.createWriteStream(d.file_path);
                try {
                    d.requests = [
                        http.get(d.url, (resp) => {
                            if (resp.statusCode === 302) {
                                // fuck you
                                try {
                                    d.requests.push(
                                        http.get(resp.headers.location, (redirectResp) => {
                                            this.handleResponse(d, redirectResp, complete);
                                        }).on('error', (error) => {
                                            d.stream.close();
                                            fs.unlinkSync(d.file_path);
                                            this.db.prepare(`UPDATE tblDownload SET download_error = ? WHERE id = ?`).run(error.toString(), d.id);
                                        })
                                    );
                                } catch (err) {
                                    d.stream.close();
                                    fs.unlinkSync(d.file_path);
                                    this.db.prepare(`UPDATE tblDownload SET download_error = ? WHERE id = ?`).run(err.toString(), d.id);
                                }
                            } else this.handleResponse(d, resp, complete);
                        }).on("error", (error) => {
                            d.stream.close();
                            fs.unlinkSync(d.file_path);
                            this.db.prepare(`UPDATE tblDownload SET download_error = ? WHERE id = ?`).run(error.toString(), d.id);
                        })
                    ];
                    this.downloading.push(d);
                } catch (err) {
                    d.stream.close();
                    fs.unlinkSync(d.file_path);
                    this.db.prepare(`UPDATE tblDownload SET download_error = ? WHERE id = ?`).run(err.toString(), d.id);
                }
            });
            
            // get downloads that were completed, but extraction was interrupted
            const toExtract = this.db.prepare(`
                SELECT *
                FROM tblDownload
                WHERE
                    is_downloaded = 1
                    AND is_extracted = 0
                    AND extract_error IS NULL
            `).all();
            
            for (let i = 0;i < toExtract.length;i++) {
                await this.extract(toExtract[i]);
            }
        } catch (err) {
            console.error(err);
        }
    }
};

module.exports = Downloader;
