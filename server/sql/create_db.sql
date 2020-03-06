CREATE TABLE tblTrack (
	id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
	show_id		INTEGER REFERENCES tblShow (id) NOT NULL,
	track_index	INTEGER,
	title		TEXT,
	bit_rate	REAL,
	duration	REAL,
	sample_rate REAL,
	channels	INTEGER,
    file_path   TEXT NOT NULL
);
[next]
CREATE TABLE tblArtist (
	id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
	name		TEXT NOT NULL UNIQUE
);
[next]
CREATE TABLE tblShowArtist (
	show_id INTEGER REFERENCES tblShow (id) NOT NULL,
	artist_id INTEGER REFERENCES tblArtist (id) NOT NULL
);
[next]
CREATE TABLE tblTrackArtist (
	track_id INTEGER REFERENCES tblTrack (id) NOT NULL,
	artist_id INTEGER REFERENCES tblArtist (id) NOT NULL
);
[next]
CREATE TABLE tblGenre (
	id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
	name		TEXT UNIQUE NOT NULL
);
[next]
CREATE TABLE tblShowGenre (
	show_id INTEGER REFERENCES tblShow (id),
	genre_id INTEGER REFERENCES tblGenre (id)
);
[next]
CREATE TABLE tblTrackGenre (
	track_id INTEGER REFERENCES tblTrack (id),
	genre_id INTEGER REFERENCES tblGenre (id)
);
