INSERT INTO
  playlists (
    source_url,
    source_id,
    added_ts,
    status,
    synchronization_ts
  )
VALUES
  ($1, $2, $3, $4, $5)
RETURNING
  id AS playlist_id,
  source_url AS playlist_source_url,
  source_id,
  added_ts AS playlist_added_ts,
  status AS playlist_status,
  synchronization_ts AS playlist_synchronization_ts,
  title AS playlist_title
