INSERT INTO
  tag_mappings (
    user_id,
    file_id,
    title,
    artist,
    album,
    picture,
    year,
    track_number
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8)
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
