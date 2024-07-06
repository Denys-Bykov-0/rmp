DELETE FROM user_files
WHERE
  user_id = $1
  AND id = $2
