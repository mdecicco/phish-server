CREATE TABLE tblCoverArt ( 
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    link_id     INTEGER REFERENCES tblLink(id),
    date        DATETIME,
    file_path   TEXT NOT NULL UNIQUE
);
