SELECT
  *
FROM
  user_playlists as up
WHERE
  up.playlist_id = $1
