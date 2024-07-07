DELETE FROM user_playlists
WHERE
  user_id = $1
  AND playlist_id = $2
