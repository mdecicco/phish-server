CREATE TABLE tblShowArtist (
	show_id INTEGER REFERENCES tblShow (id) NOT NULL,
	artist_id INTEGER REFERENCES tblArtist (id) NOT NULL
);
