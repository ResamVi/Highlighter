create table if not exists highlights
(
    uuid        varchar(128)  default '' not null primary key,
    highlights  jsonb         null
);

INSERT INTO highlights (uuid, highlights) VALUES ('8ad5ec76-ae1e-424b-9271-d640c4f8fee8', '{"hello": "world"}');

