CREATE TABLE tblShow ( 
    id              INTEGER PRIMARY KEY NOT NULL UNIQUE,
    pdn_id          INTEGER,
    date            DATE,
    date_str        TEXT NOT NULL,
    raw_data        TEXT NOT NULL,
    city            TEXT,
    state           TEXT,
    venue           TEXT,
    source          TEXT,
    notes           TEXT,
    is_sbd          BOOLEAN NOT NULL,
    added_on        DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
