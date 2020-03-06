const mime = require('mime-types');
const fs = require('fs');

module.exports = {
    bind: function(route, db, collector, downloader) {
        const api = route.addSubRoute('api');
        api.addSubRoute('shows', {
            get: (args) => {
                const { callback } = args;
                try {
                    callback(200, {
                        shows: db.prepare('SELECT * FROM vwShowInfo ORDER BY timestamp ASC').all(),
                        error: null
                    }, 'application/json');
                } catch (err) {
                    callback(500, {
                        shows: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        });
        api.addSubRoute('show', {
            get: (args) => {
                const { callback, remainingPath } = args;
                try {
                    const showId = remainingPath.length === 1 ? parseInt(remainingPath[0], 10) : null;
                    if (!showId || isNaN(showId)) {
                        callback(404, null);
                        return null;
                    }
                    
                    const show = db.prepare('SELECT * FROM vwShowInfo WHERE id = ?').get(showId)
                    if (!show) {
                        callback(404, null);
                        return;
                    }
                    
                    const links = db.prepare('SELECT * FROM tblLink WHERE show_id = ?').all(showId);
                    const tracks = db.prepare('SELECT * FROM tblTrack WHERE show_id = ?').all(showId);
                    const downloads = db.prepare('SELECT * FROM tblDownload WHERE show_id = ?').all(showId);
                    links.forEach(l => {
                        l.download = downloads.find(d => d.link_id = l.id);
                        delete l.download.file_path;
                    });
                    
                    show.tracks = { };
                    tracks.forEach(t => {
                        delete t.file_path;
                        
                        if (!show.tracks.hasOwnProperty(t.link_id)) show.tracks[t.link_id] = [t];
                        else show.tracks[t.link_id].push(t);
                    });
                    
                    show.links = links;
                    
                    callback(200, { show, error: null }, 'application/json');
                } catch (err) {
                    callback(500, {
                        show: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        });
        api.addSubRoute('track', {
            get: (args) => {
                const { callback, remainingPath } = args;
                try {
                    let wantsStream = false;
                    if (remainingPath.length === 2) {
                        if (remainingPath[1] === 'stream') wantsStream = true;
                        else {
                            callback(404, null);
                            return;
                        }
                    }
                    const trackId = (remainingPath.length === 1 || remainingPath.length === 2) ? parseInt(remainingPath[0], 10) : null;
                    if (!trackId || isNaN(trackId)) {
                        callback(404, null);
                        return;
                    }
                    const track = db.prepare('SELECT * FROM tblTrack WHERE id = ?').get(trackId)
                    if (!track) {
                        callback(404, null);
                        return;
                    }
                    
                    const artists = db.prepare('SELECT * FROM tblArtist WHERE EXISTS (SELECT track_id FROM tblTrackArtist WHERE track_id = ? AND artist_id = tblArtist.id)').all(trackId);
                    if (artists) track.artists = artists;
                    else track.artists = [];
                    
                    const genres = db.prepare('SELECT * FROM tblGenre WHERE EXISTS (SELECT track_id FROM tblTrackGenre WHERE track_id = ? AND genre_id = tblGenre.id)').all(trackId);
                    if (genres) track.genres = genres;
                    else track.genres = [];
                    
                    if (wantsStream) {
                        const type = mime.lookup(track.file_path);
                        const contents = fs.readFileSync(track.file_path, 'binary');
                        callback(200, contents, type, { 'Content-Length': contents.length }, 'binary');
                    } else delete track.file_path;
                    
                    callback(200, { track, error: null }, 'application/json');
                } catch (err) {
                    callback(500, {
                        track: null,
                        error: err.toString()
                    }, 'application/json');
                }
            }
        });
        api.addSubRoute('cover', {
            get: (args) => {
                const { callback, remainingPath } = args;
                try {
                    if (remainingPath.length === 1 && remainingPath[0] === 'null') {
                        const type = mime.lookup('./dist/no_cover.png');
                        const contents = fs.readFileSync('./dist/no_cover.png', 'binary');
                        callback(200, contents, type, { 'Content-Length': contents.length }, 'binary');
                        return;
                    }
                    
                    const coverId = remainingPath.length === 1 ? parseInt(remainingPath[0], 10) : null;
                    if (!coverId || isNaN(coverId)) {
                        callback(404, null);
                        return;
                    }
                    
                    const cover = db.prepare('SELECT * FROM tblCoverArt WHERE id = ?').get(coverId)
                    if (!cover) {
                        callback(404, null);
                        return;
                    }
                    
                    const type = mime.lookup(cover.file_path);
                    const contents = fs.readFileSync(cover.file_path, 'binary');
                    callback(200, contents, type, { 'Content-Length': contents.length }, 'binary');
                } catch (err) {
                    callback(500, err.toString(), 'text/plain');
                }
            }
        });
        api.addSubRoute('downloads', {
            get: (args) => {
                const { callback } = args;
                try {
                    callback(200, {
                        downloads: db.prepare('SELECT * FROM tblDownload').all(),
                        error: null
                    }, 'application/json');
                } catch (err) {
                    callback(500, {
                        downloads: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        });
        api.addSubRoute('downloading', {
            get: (args) => {
                const { callback } = args;
                try {
                    const downloading = downloader.downloading;
                    const extracting = downloader.extracting;
                    const all = downloading.concat(extracting);
                    const showIds = all.filter(d => d.show_id).map(d => d.show_id);
                    if (showIds.length > 0) {
                        const shows = db.prepare(`SELECT * FROM tblShow WHERE id IN (${showIds.join(',')})`).all();
                        all.forEach(d => {
                            d.show = shows.find(s => s.id === d.show_id) || null;
                        });
                    }
                    const linkIds = all.map(d => d.link_id);
                    if (linkIds.length > 0) {
                        const links = db.prepare(`SELECT * FROM tblLink WHERE id IN (${linkIds.join(',')})`).all();
                        all.forEach(d => {
                            d.link = links.find(l => l.id === d.link_id) || null;
                        });
                    }
                    
                    downloading.forEach(d => { delete d.file_path; });
                    callback(200, { all, downloading, extracting, error: null }, 'application/json');
                } catch (err) {
                    callback(500, { all: [], downloading: [], extracting: [], error: err }, 'application/json');
                }
            }
        });
        /*
        api.addSubRoute('dbg', {
            get: (args) => {
                const { callback } = args;
                try {
                    callback(200, { }, 'application/json');
                } catch (err) {
                    callback(500, err, 'text/plain');
                }
            }
        });
        */
    }
};
