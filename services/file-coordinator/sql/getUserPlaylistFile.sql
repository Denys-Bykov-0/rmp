SELECT
  id AS user_playlist_file_id,
  file_id AS user_playlist_file_file_id,
  user_playlist_id AS user_playlist_file_user_playlist_id,
  missing_from_remote AS user_playlist_file_missing_from_remote
FROM
  user_playlist_files AS upf
  JOIN user_playlists AS up ON up.id = upf.user_playlist_id
WHERE
  up.user_id = $1
  AND upf.file_id = $2
  AND up.playlist_id = $3
