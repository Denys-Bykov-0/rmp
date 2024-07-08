SELECT
  id AS user_playlist_file_id,
  file_id AS user_playlist_file_file_id,
  user_playlist_id AS user_playlist_file_user_playlist_id,
  missing_from_remote AS user_playlist_file_missing_from_remote
FROM
  user_playlists as up
WHERE
  up.playlist_id = $1
