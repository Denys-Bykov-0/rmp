UPDATE file_synchronization
SET
  server_ts = $1
WHERE
  user_file_id = $2
