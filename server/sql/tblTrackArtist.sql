CREATE TABLE tblTrackArtist (
	track_id INTEGER REFERENCES tblTrack (id) NOT NULL,
	artist_id INTEGER REFERENCES tblArtist (id) NOT NULL
);
