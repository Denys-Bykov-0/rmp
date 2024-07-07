SELECT
  upf.id,
  upf.file_id,
  upf.user_playlist_id,
  upf.missing_from_remote
FROM
  user_playlist_files AS upf
  JOIN user_playlists AS up ON up.id = upf.user_playlist_id
WHERE
  upf.file_id = $1
  AND up.user_id = $2
