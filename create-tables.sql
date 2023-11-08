CREATE TABLE users (
  id SERIAL NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL
);

CREATE TYPE event_kind AS ENUM (
 'created', 
 'updated' 
);

CREATE TABLE events_history (
  id SERIAL NOT NULL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  kind event_kind NOT NULL,
  user_id INT NOT NULL REFERENCES users(id),
  fields JSONB
);

CREATE OR REPLACE FUNCTION updated_at_func()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER updated_at_trig 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE updated_at_func();

-- COPY users (name) FROM stdin;
-- Peter
-- Johny
-- Vasil
-- Jack
-- Bob
-- Alice
-- Ivan
-- \.
