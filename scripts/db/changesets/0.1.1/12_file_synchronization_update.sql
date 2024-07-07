--liquibase formatted sql
--changeset VolodymyrFihurniak:12

ALTER TABLE file_synchronization ADD COLUMN was_changed BOOLEAN NOT NULL DEFAULT FALSE;
