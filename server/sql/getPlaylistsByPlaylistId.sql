SELECT
  p.id AS playlist_id,
  s.id AS source_id,
  s.description AS source_description,
  p.status AS playlist_status,
  p.source_url AS playlist_source_url,
  p.added_ts AS playlist_added_ts,
  p.synchronization_ts AS playlist_synchronization_ts,
  p.title AS playlist_title
FROM
  playlists AS p
  JOIN sources AS s ON p.source_id = s.id
  JOIN user_playlists AS up ON p.id = up.playlist_id
WHERE
  up.user_id = $1
  AND p.id = $2
