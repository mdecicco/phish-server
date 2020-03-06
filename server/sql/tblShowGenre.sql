CREATE TABLE tblShowGenre (
	show_id INTEGER REFERENCES tblShow (id),
	genre_id INTEGER REFERENCES tblGenre (id)
);
