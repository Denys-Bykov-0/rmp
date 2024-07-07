UPDATE tag_mappings
SET
  title = $1,
  artist = $2,
  album = $3,
  picture = $4,
  year = $5,
  track_number = $6,
  fixed = $7
WHERE
  file_id = $8
RETURNING
  id as tag_mapping_id,
  user_id as tag_mapping_user_id,
  file_id as tag_mapping_file_id,
  title as tag_mapping_title,
  artist as tag_mapping_artist,
  album as tag_mapping_album,
  picture as tag_mapping_picture,
  year as tag_mapping_year,
  track_number as tag_mapping_track_number
