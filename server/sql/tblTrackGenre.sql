CREATE TABLE tblTrackGenre (
	track_id INTEGER REFERENCES tblTrack (id),
	genre_id INTEGER REFERENCES tblGenre (id)
);
