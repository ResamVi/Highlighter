create table if not exists highlights
(
    uuid        varchar(128)    default '' not null primary key,
    highlights  jsonb           null,
    created_at  timestamptz     NOT NULL DEFAULT NOW(),
    updated_at  timestamptz     NOT NULL DEFAULT NOW()
);

INSERT INTO highlights (uuid, highlights) VALUES ('8ad5ec76-ae1e-424b-9271-d640c4f8fee8', '{"hello": "world"}');

-- updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON highlights
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
