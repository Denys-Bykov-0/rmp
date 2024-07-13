--liquibase formatted sql
--changeset VolodymyrFihurniak:13

UPDATE file_synchronization
SET
  was_changed = TRUE
WHERE
  is_synchronized = TRUE;
