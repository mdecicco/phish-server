CREATE VIEW vwShowInfo AS
WITH showinfo_2 AS (
    WITH showinfo_1 AS (
        WITH showinfo_0 AS (
            SELECT
                s.id,
                l.id AS link_id,
                l.url AS link_url,
                MIN(s.pdn_id) AS pdn_id,
                MIN(s.date) AS timestamp,
                MIN(s.date_str) AS date,
                MIN(s.venue) AS venue,
                MIN(s.raw_data) AS metadata,
                MIN(s.city) AS city,
                MIN(s.state) AS state,
                MIN(s.source) AS source,
                MIN(s.notes) AS notes,
                MIN(s.is_sbd) AS is_sbd,
                MIN(s.added_on) AS added_on,
                MIN(t.cover_art_id) AS cover_art_id,
                SUM(t.duration) AS duration,
                COUNT(t.id) AS track_count,
                GROUP_CONCAT(t.id, ',') AS track_ids,
                GROUP_CONCAT(t.title, '&&') AS track_titles,
                GROUP_CONCAT(t.duration, ',') AS track_durations
            FROM tblShow AS s
            LEFT OUTER JOIN tblLink AS l ON l.show_id = s.id AND l.is_folder = 0
            LEFT OUTER JOIN tblTrack AS t ON t.show_id = s.id AND t.link_id = l.id
            GROUP BY s.id, l.id
        )
        SELECT
            s.*,
            GROUP_CONCAT(g.id, ',') AS genre_ids,
            GROUP_CONCAT(g.name, ',') AS genres
        FROM showinfo_0 AS s
        LEFT OUTER JOIN tblShowGenre AS sg ON sg.show_id = s.id
        LEFT OUTER JOIN tblGenre AS g ON g.id = sg.genre_id
        GROUP BY s.id, s.link_id
    )
    SELECT
        s.*,
        GROUP_CONCAT(a.id, ',') AS artist_ids,
        GROUP_CONCAT(a.name, ',') AS artists
    FROM showinfo_1 AS s
    LEFT OUTER JOIN tblShowArtist AS sa ON sa.show_id = s.id
    LEFT OUTER JOIN tblArtist AS a ON a.id = sa.artist_id
    GROUP BY s.id, s.link_id
)
SELECT * FROM showinfo_2;
