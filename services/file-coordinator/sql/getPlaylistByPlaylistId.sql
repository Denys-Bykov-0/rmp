SELECT
  p.id,
  s.id AS source_id,
  s.description AS source_description,
  p.status,
  p.source_url,
  p.synchronization_ts,
  p.title
FROM
  playlists AS p
  JOIN sources AS s ON p.source_id = s.id
  JOIN user_playlists AS up ON p.id = up.playlist_id
WHERE
  p.id = $1
