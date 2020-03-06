CREATE TABLE tblTrack (
    id              INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    show_id         INTEGER REFERENCES tblShow (id) NOT NULL,
    link_id         INTEGER REFERENCES tblLink (id) NOT NULL,
    cover_art_id    INTEGER REFERENCES tblCoverArt (id),
    track_index     INTEGER,
    title           TEXT,
    bit_rate        REAL,
    duration        REAL,
    sample_rate     REAL,
    channels        INTEGER,
    lossless        BOOLEAN NOT NULL,
    codec           TEXT,
    codec_profile   TEXT,
    note            TEXT,
    file_path       TEXT NOT NULL
);
