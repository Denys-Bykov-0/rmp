SELECT
  id,
  user_id,
  playlist_id,
  added_ts
FROM
  user_playlists as up
WHERE
  up.playlist_id = $1
