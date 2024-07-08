UPDATE file_synchronization
SET
  is_synchronized = $1,
  was_changed = $2,
  server_ts = $3
WHERE
  user_file_id = $4
