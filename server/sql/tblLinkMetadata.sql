CREATE TABLE tblLinkMetadata ( 
    id              INTEGER PRIMARY KEY NOT NULL UNIQUE,
    show_id         INTEGER REFERENCES tblShow (id) NOT NULL,
    link_id         INTEGER REFERENCES tblLink (id) NOT NULL,
    file_path       TEXT NOT NULL
);
