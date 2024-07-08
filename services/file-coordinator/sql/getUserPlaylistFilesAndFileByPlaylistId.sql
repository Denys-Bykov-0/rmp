SELECT
  upf.id AS user_playlist_file_id,
  upf.file_id AS user_playlist_file_file_id,
  upf.user_playlist_id AS user_playlist_file_user_playlist_id,
  upf.missing_from_remote AS user_playlist_file_missing_from_remote,
  f.id as file_id,
  f.path as file_path,
  f.source as file_source,
  f.status as file_status,
  f.source_url as file_source_url
FROM
  user_playlist_files AS upf
  JOIN files AS f ON f.id = upf.file_id
WHERE
  upf.user_playlist_id = $1
