UPDATE user_playlist_files
SET
  missing_from_remote = $2
WHERE
  file_id = $1
