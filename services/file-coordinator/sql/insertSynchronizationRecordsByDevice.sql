INSERT INTO
  file_synchronization (user_file_id, device_id)
VALUES
  ($1, $2)
ON CONFLICT (user_file_id, device_id) DO NOTHING;
