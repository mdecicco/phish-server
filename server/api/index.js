const mime = require('mime-types');
const fs = require('fs');
const { values } = require('lodash');

const FilterableType = {
    Timestamp: 'ts',
    Datetime: 'dt',
    ShowDate: 'sd',
    Str: 's',
    Bool: 'b',
    Num: 'n'
};

function parseBool(v) {
    let tlc = (typeof v === 'string') ? v.trim().toLowerCase() : v;
    if (tlc === '1' || tlc === 'true' || tlc === 1) return true;
    else if (tlc === '0' || tlc === 'false' || tlc === 0) return false;
    return null;
}

function parseTimestamp(v) {
    if ((typeof v) === 'string') {
        const i = parseInt(v, 10);
        if (i.toString() === v.trim()) return i;
    } else if ((typeof v) === 'number') return v;

    const o = Date.parse(v);
    if (isNaN(o)) return null;
    return o;
}

function parseDatetime(v) {
    const o = parseTimestamp(v);
    if (o === null) return null;

    return (new Date(o)).toISOString().split('T').join(' ');
}

function executeQuery(db, table, params, columnInfo) {
    let where = '';
    let order = '';
    let limit = '';
    let offset = '';

    if (params.limit) {
        const i = parseInt(params.limit, 10);
        if (isNaN(i) || i < 0) throw 'Client provided invalid limit';
        limit = `LIMIT ${i}`;

        if (params.offset) {
            const i = parseInt(params.offset, 10);
            if (isNaN(i) || i < 0) throw 'Client provided invalid offset';
            offset = `OFFSET ${i}`;
        }
    }

    const clauses = [];
    const parameters = [];
    const searchTerms = params.hasOwnProperty('search') ? params.search.split(',').map(t => t.toLowerCase().trim()) : [];
    columnInfo.forEach(col => {
        switch (col.type) {
            case FilterableType.Datetime: {
                if (params.hasOwnProperty(`${col.name}_lt`)) {
                    const v = parseDatetime(params[`${col.name}_lt`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_lt`;
                    clauses.push(`${col.name} < ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_lte`)) {
                    const v = parseDatetime(params[`${col.name}_lte`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_lte`;
                    clauses.push(`${col.name} <= ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_gt`)) {
                    const v = parseDatetime(params[`${col.name}_gt`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_gt`;
                    clauses.push(`${col.name} > ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_gte`)) {
                    const v = parseDatetime(params[`${col.name}_gte`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_gte`;
                    clauses.push(`${col.name} >= ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_not`)) {
                    const v = parseDatetime(params[`${col.name}_not`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_not`;
                    clauses.push(`${col.name} != ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                
                if (params.hasOwnProperty(col.name)) {
                    const v = parseDatetime(params[col.name]);
                    if (v === null) throw `Client provided invalid value for ${col.name}`;
                    clauses.push(`${col.name} = ?`);
                    parameters.push(v);
                }
                break;
            }
            case FilterableType.ShowDate: {
                if (params.hasOwnProperty(`${col.name}`)) {
                    clauses.push(`${col.name} = ?`);
                    parameters.push(params[`${col.name}`]);
                }
                
                if (params.hasOwnProperty(`${col.name}_like`)) {
                    clauses.push(`lower(${col.name}) LIKE ?`);
                    parameters.push(`%${params[`${col.name}`]}%`);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                break;
            }
            case FilterableType.Str: {
                if (params.hasOwnProperty(`${col.name}`)) {
                    clauses.push(`${col.name} = ?`);
                    parameters.push(params[`${col.name}`]);
                }

                if (params.hasOwnProperty(`${col.name}_like`)) {
                    clauses.push(`lower(${col.name}) LIKE ?`);
                    parameters.push(`%${params[`${col.name}`].toLowerCase().trim()}%`);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                break;
            }
            case FilterableType.Bool: {
                if (params.hasOwnProperty(`${col.name}`)) {
                    const v = parseBool(params[`${col.name}`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}`;
                    clauses.push(`${col.name} = ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                break;
            }
            case FilterableType.Timestamp: {
                if (params.hasOwnProperty(`${col.name}_lt`)) {
                    const v = parseTimestamp(params[`${col.name}_lt`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_lt`;
                    clauses.push(`${col.name} < ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_lte`)) {
                    const v = parseTimestamp(params[`${col.name}_lte`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_lte`;
                    clauses.push(`${col.name} <= ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_gt`)) {
                    const v = parseTimestamp(params[`${col.name}_gt`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_gt`;
                    clauses.push(`${col.name} > ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_gte`)) {
                    const v = parseTimestamp(params[`${col.name}_gte`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_gte`;
                    clauses.push(`${col.name} >= ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_not`)) {
                    const v = parseTimestamp(params[`${col.name}_not`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_not`;
                    clauses.push(`${col.name} != ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                
                if (params.hasOwnProperty(col.name)) {
                    const v = parseTimestamp(params[col.name]);
                    if (v === null) throw `Client provided invalid value for ${col.name}`;
                    clauses.push(`${col.name} = ?`);
                    parameters.push(v);
                }
                break;
            }
            case FilterableType.Num: {
                if (params.hasOwnProperty(`${col.name}_lt`)) {
                    const v = parseFloat(params[`${col.name}_lt`]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}_lt`;
                    clauses.push(`${col.name} < ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_lte`)) {
                    const v = parseFloat(params[`${col.name}_lte`]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}_lte`;
                    clauses.push(`${col.name} <= ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_gt`)) {
                    const v = parseFloat(params[`${col.name}_gt`]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}_gt`;
                    clauses.push(`${col.name} > ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_gte`)) {
                    const v = parseFloat(params[`${col.name}_gte`]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}_gte`;
                    clauses.push(`${col.name} >= ?`);
                    parameters.push(v);
                }
                
                if (params.hasOwnProperty(`${col.name}_not`)) {
                    const v = parseFloat(params[`${col.name}_not`]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}_not`;
                    clauses.push(`${col.name} != ?`);
                    parameters.push(v);
                }

                if (params.hasOwnProperty(`${col.name}_null`)) {
                    const v = parseBool(params[`${col.name}_null`]);
                    if (v === null) throw `Client provided invalid value for ${col.name}_null`;
                    clauses.push(`${col.name} IS ${v ? '' : 'NOT'} NULL`);
                }
                
                if (params.hasOwnProperty(col.name)) {
                    const v = parseFloat(params[col.name]);
                    if (isNaN(v)) throw `Client provided invalid value for ${col.name}`;
                    clauses.push(`${col.name} = ?`);
                    parameters.push(v);
                }
                break;
            }
        }

        if (params.hasOwnProperty(`order`)) {
            if (params.order === `${col.name}_asc`) order = `ORDER BY ${col.name} ASC`;
            if (params.order === `${col.name}_desc`) order = `ORDER BY ${col.name} DESC`;
        }
    });

    searchTerms.forEach(t => {
        const or_clauses = [];
        columnInfo.forEach(col => {
            switch (col.type) {
                case FilterableType.ShowDate:
                case FilterableType.Str: {
                    or_clauses.push(`lower(${col.name}) LIKE ?`);
                    parameters.push(`%${t}%`);
                    break;
                }
            }
        });

        if (or_clauses.length > 0) {
            clauses.push(`(${or_clauses.join(' OR ')})`);
        }
    });

    where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    
    console.log(`SELECT * FROM ${table} ${where} ${order} ${limit} ${offset}`, parameters);
    return {
        results: db.prepare(`SELECT * FROM ${table} ${where} ${order} ${limit} ${offset}`).all(parameters),
        total_count: db.prepare(`SELECT COUNT(*) AS c FROM ${table} ${where}`).get(parameters).c,
    };
}

function queryShows(db, params) {
    return executeQuery(db, 'vwShowInfo', params, [
        { name: 'timestamp', type: FilterableType.Timestamp },
        { name: 'date', type: FilterableType.ShowDate },
        { name: 'venue', type: FilterableType.Str },
        { name: 'city', type: FilterableType.Str },
        { name: 'state', type: FilterableType.Str },
        { name: 'source', type: FilterableType.Str },
        { name: 'notes', type: FilterableType.Str },
        { name: 'is_sbd', type: FilterableType.Bool },
        { name: 'added_on', type: FilterableType.Datetime },
        { name: 'duration', type: FilterableType.Num },
        { name: 'track_count', type: FilterableType.Num },
        { name: 'track_titles', type: FilterableType.Str },
        { name: 'genres', type: FilterableType.Str },
        { name: 'artists', type: FilterableType.Str },
        { name: 'metadata', type: FilterableType.Str } // useful for general searches
    ]);
}

function queryTracks(db, params) {
    return executeQuery(db, 'vwTrackInfo', params, [
        { name: 'timestamp', type: FilterableType.Timestamp },
        { name: 'date', type: FilterableType.ShowDate },
        { name: 'venue', type: FilterableType.Str },
        { name: 'city', type: FilterableType.Str },
        { name: 'state', type: FilterableType.Str },
        { name: 'show_id', type: FilterableType.Num },
        { name: 'link_id', type: FilterableType.Num },
        { name: 'track_index', type: FilterableType.Num },
        { name: 'duration', type: FilterableType.Num },
        { name: 'sample_rate', type: FilterableType.Num },
        { name: 'bit_rate', type: FilterableType.Num },
        { name: 'channels', type: FilterableType.Num },
        { name: 'lossless', type: FilterableType.Bool },
        { name: 'title', type: FilterableType.Str },
        { name: 'note', type: FilterableType.Str },
        { name: 'codec', type: FilterableType.Str },
        { name: 'codec_profile', type: FilterableType.Str },
        { name: 'show_metadata', type: FilterableType.Str } // useful for general searches
    ]);
}

function queryCovers(db, params) {
    return executeQuery(db, 'tblCoverArt', params, [
        { name: 'link_id', type: FilterableType.Num },
        { name: 'date', type: FilterableType.Datetime }
    ]);
}

module.exports = {
    bind: function(route, db, collector, downloader) {
        const api = route.addSubRoute('api');
        api.addSubRoute('shows', {
            get: (args) => {
                const { params, callback } = args;
                try {
                    data = queryShows(db, params);
                    callback(200, {
                        results: data.results,
                        total_count: data.total_count,
                        error: null,
                    }, 'application/json');
                } catch (err) {
                    callback(500, {
                        results: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        }).addSubRoute(':show_id', {
            get: (args) => {
                const { callback, pathParams } = args;
                try {
                    const showId = pathParams.hasOwnProperty('show_id') ? parseInt(pathParams.show_id, 10) : null;
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
                    const tracks = db.prepare('SELECT * FROM vwTrackInfo WHERE show_id = ?').all(showId);
                    const downloads = db.prepare('SELECT * FROM tblDownload WHERE show_id = ?').all(showId);
                    links.forEach(l => {
                        l.download = downloads.find(d => d.link_id = l.id);
                        delete l.download.file_path;
                    });


                    const artists = db.prepare(`
                        SELECT *
                        FROM tblTrackArtist AS ta
                        LEFT OUTER JOIN tblArtist AS a ON a.id = ta.artist_id
                        WHERE ta.track_id IN (${tracks.map(t => t.id).join(',')})
                    `).all();

                    const genres = db.prepare(`
                        SELECT *
                        FROM tblTrackGenre AS tg
                        LEFT OUTER JOIN tblGenre AS g ON g.id = tg.genre_id
                        WHERE tg.track_id IN (${tracks.map(t => t.id).join(',')})
                    `).all();
                    
                    show.tracks = { };
                    tracks.forEach(t => {
                        delete t.file_path;
                        
                        if (artists) t.artists = artists.filter(a => a.track_id === t.id);
                        else t.artists = [];
                        
                        if (genres) t.genres = genres.filter(g => g.track_id === t.id);
                        else t.genres = [];
                        
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

        api.addSubRoute('tracks', {
            get: (args) => {
                const { params, callback } = args;
                try {
                    data = queryTracks(db, params);

                    data.results.forEach(t => {
                        delete t.file_path;
                    });

                    callback(200, {
                        results: data.results,
                        total_count: data.total_count,
                        error: null,
                    }, 'application/json');
                } catch (err) {
                    callback(500, {
                        results: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        }).addSubRoute(':track_id', {
            get: (args) => {
                const { request, callback, pathParams } = args;
                try {
                    const trackId = pathParams.hasOwnProperty('track_id') ? parseInt(pathParams.track_id, 10) : null;
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
                    
                    delete track.file_path;
                    
                    callback(200, { track, error: null }, 'application/json');
                } catch (err) {
                    callback(500, {
                        track: null,
                        error: err.toString()
                    }, 'application/json');
                }
            }
        }).addSubRoute('stream', {
            get: (args) => {
                const { request, callback, pathParams } = args;
                try {
                    const trackId = pathParams.hasOwnProperty('track_id') ? parseInt(pathParams.track_id, 10) : null;
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
                    
                    const type = mime.lookup(track.file_path);
                    const contents = fs.readFileSync(track.file_path, 'binary');
                    if (request.headers.range) {
                        const range = request.headers.range;
                        const total = contents.length;
                        const parts = range.replace(/bytes=/, "").split("-");
                        const partialStart = parts[0];
                        const partialEnd = parts[1];
                        const start = parseInt(partialStart, 10);
                        const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
                        const chunkSize = (end - start) + 1;
                        console.log(`Range: ${start} to ${end} (${chunkSize} bytes)`);
                        if ((start > end) || start >= total || end >= total) {
                            callback(416, null, null, { 'Content-Range': `bytes */${total}` });
                            return;
                        }
                        
                        callback(206, contents.slice(start, end + 1), type, {
                            'Content-Range': `bytes ${start}-${end}/${total}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunkSize
                        }, 'binary');
                        return;
                    }
                    callback(200, contents, type, { 'Content-Length': contents.length }, 'binary');
                    return;
                } catch (err) {
                    callback(500, {
                        track: null,
                        error: err.toString()
                    }, 'application/json');
                }
            }
        });

        api.addSubRoute('covers', {
            get: (args) => {
                const { params, callback } = args;
                try {
                    data = queryCovers(db, params);

                    data.results.forEach(c => {
                        delete c.file_path;
                        c.url = `${args.request.headers.host}/api/covers/${c.id}`;
                    });

                    callback(200, {
                        results: data.results,
                        total_count: data.total_count,
                        error: null,
                    }, 'application/json');
                } catch (err) {
                    callback(500, {
                        results: [],
                        error: err.toString()
                    }, 'application/json');
                }
            }
        }).addSubRoute(':cover_id', {
            get: (args) => {
                const { callback, pathParams } = args;
                try {
                    let coverId = pathParams.hasOwnProperty('cover_id') ? pathParams.cover_id : null;
                    if (coverId === 'null') {
                        const type = mime.lookup('./dist/no_cover.png');
                        const contents = fs.readFileSync('./dist/no_cover.png', 'binary');
                        callback(200, contents, type, { 'Content-Length': contents.length }, 'binary');
                        return;
                    }

                    coverId = parseInt(coverId, 10);
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
                    const downloading = Array.from(downloader.downloading, d => Object.assign({}, d));
                    const extracting = Array.from(downloader.extracting, e => Object.assign({}, e));
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

        api.addSubRoute('dbg', {
            get: (args) => {
                console.log(args.params);
                const { params, callback } = args;
                try {
                    callback(200, params, 'application/json');
                } catch (err) {
                    callback(500, err, 'text/plain');
                }
            }
        });
    }
};
