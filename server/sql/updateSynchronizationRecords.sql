UPDATE file_synchronization
SET
  server_ts = $1,
  is_synchronized = $3,
  was_changed = $4
WHERE
  user_file_id = $2
