--liquibase formatted sql
--changeset VolodymyrFihurniak:4

CREATE TABLE files (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    path VARCHAR(255) NULL UNIQUE,
    source_url VARCHAR(255) NOT NULL UNIQUE,
    source INT NOT NULL,
    status VARCHAR(2) NOT NULL,
    CONSTRAINT fk_source_files_id FOREIGN KEY (source) REFERENCES sources(id),
    CONSTRAINT fk_status_files FOREIGN KEY (status) REFERENCES file_statuses(status)
);

CREATE INDEX idx_source_url_files ON files (source_url);
