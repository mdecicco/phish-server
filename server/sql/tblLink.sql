CREATE TABLE tblLink ( 
    id          INTEGER PRIMARY KEY NOT NULL UNIQUE,
    show_id     INTEGER REFERENCES tblShow (id),
    url         TEXT NOT NULL,
    is_valid    BOOLEAN NOT NULL,
    is_folder   BOOLEAN NOT NULL
);
