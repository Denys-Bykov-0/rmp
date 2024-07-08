SELECT
  *
FROM
  user_playlist_files AS upf
  JOIN user_playlists AS up ON up.id = upf.user_playlist_id
WHERE
  up.user_id = $1
  AND upf.file_id = $2
  AND up.playlist_id = $3
