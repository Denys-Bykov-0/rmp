DELETE FROM tag_mappings
WHERE
  user_id = $1
  AND file_id = $2
