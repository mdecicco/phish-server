CREATE TABLE tblDownload ( 
    id              INTEGER PRIMARY KEY NOT NULL UNIQUE,
    show_id         INTEGER REFERENCES tblShow (id),
    link_id         INTEGER REFERENCES tblLink (id) NOT NULL,
    is_downloaded   BOOLEAN NOT NULL DEFAULT 0,
    is_extracted    BOOLEAN NOT NULL DEFAULT 0,
    download_error  TEXT,
    extract_error   TEXT,
    attempts        INTEGER NOT NULL DEFAULT 0,
    started_on      DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    finished_on     DATETIME,
    file_path       TEXT NOT NULL
);
