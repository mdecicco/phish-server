-- SQLite
CREATE VIEW vwTrackInfo
AS
    SELECT
        t.*,
        s.timestamp,
        s.date,
        s.city,
        s.state,
        s.venue,
        s.metadata AS show_metadata
    FROM tblTrack AS t
    LEFT OUTER JOIN vwShowInfo AS s ON s.id = t.show_id
    