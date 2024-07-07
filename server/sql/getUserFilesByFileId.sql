SELECT
  id AS user_file_id,
  user_id AS user_file_file_id,
  file_id AS user_file_file_id,
  added_ts AS user_file_added_ts
FROM
  user_files
WHERE
  file_id = $1
