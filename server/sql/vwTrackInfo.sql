CREATE VIEW vwTrackInfo AS
WITH trackinfo_0 AS (
    SELECT
        t.*,
        s.date AS timestamp,
        s.date_str AS date,
        s.city,
        s.state,
        s.venue,
        s.raw_data AS show_metadata,
        s.is_sbd,
        s.added_on,
        GROUP_CONCAT(a.id, ',') AS artist_ids,
        GROUP_CONCAT(a.name, '&&') AS artists
    FROM tblTrack AS t
        LEFT OUTER JOIN tblShow AS s ON s.id = t.show_id
        LEFT OUTER JOIN tblTrackArtist AS ta ON ta.track_id = t.id
        LEFT OUTER JOIN tblArtist AS a ON a.id = ta.artist_id
    GROUP BY t.id, s.id
)
SELECT
    t.*,
    GROUP_CONCAT(g.id, ',') AS genre_ids,
    GROUP_CONCAT(g.name, '&&') AS genres
FROM trackinfo_0 AS t
    LEFT OUTER JOIN tblTrackGenre AS tg ON tg.track_id = t.id
    LEFT OUTER JOIN tblGenre AS g ON g.id = tg.genre_id
GROUP BY t.id;