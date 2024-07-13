--liquibase formatted sql
--changeset VolodymyrFihurniak:14

UPDATE tags
SET picture_path = REPLACE(picture_path, '/opt/upVibe/storage/img/', '')
WHERE picture_path LIKE '/opt/upVibe/storage/img/%';
