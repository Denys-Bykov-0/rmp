SELECT
  id AS user_file_id,
  file_id AS user_file_file_id,
  user_id AS user_file_user_id,
  added_ts AS user_file_added_ts
FROM
  user_files
WHERE
  user_id = $1
  AND file_id = $2