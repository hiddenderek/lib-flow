
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (id UUID NOT NULL PRIMARY KEY, username VARCHAR(10) NOT NULL UNIQUE, password TEXT NOT NULL UNIQUE, email VARCHAR(100), date_of_birth DATE NOT NULL, time_of_signup TIMESTAMP NOT NULL);
CREATE TABLE gameData (id UUID NOT NULL PRIMARY KEY, game_name VARCHAR(28) NOT NULL UNIQUE, game_data jsonb, time_created TIMESTAMP NOT NULL, grid_image TEXT, likes INTEGER NOT NULL DEFAULT 0, plays INTEGER NOT NULL DEFAULT 0, user_id UUID NOT NULL REFERENCES users(id));
CREATE TABLE gameActions (id TEXT NOT NULL PRIMARY KEY, action VARCHAR(10) NOT NULL, game_id UUID NOT NULL REFERENCES gameData(id), user_id UUID NOT NULL REFERENCES users(id));
CREATE TABLE gameScores (id UUID NOT NULL PRIMARY KEY, score INTEGER NOT NULL, game_id UUID REFERENCES gameData(id), user_id UUID REFERENCES users(id), CONSTRAINT uniqueGameAndUser UNIQUE(user_id, game_id));
CREATE TABLE refreshTokens (id UUID NOT NULL PRIMARY KEY, refresh_token VARCHAR (600) NOT NULL UNIQUE, user_id UUID REFERENCES users(id));

ALTER TABLE gameData ADD CONSTRAINT nameMiniumLength CHECK (char_length(game_name) > 1);
ALTER TABLE gameData ADD CONSTRAINT nameCharViolation CHECK (game_name NOT ILIKE '%/%' AND game_name NOT ILIKE '%\%' AND game_name NOT ILIKE '%/%' AND game_name NOT ILIKE '%?%' AND game_name NOT ILIKE '%&%' AND game_name NOT ILIKE '%=%' AND game_name NOT ILIKE '%.%' AND game_name NOT ILIKE '%{%' AND game_name NOT ILIKE '%}%');
ALTER TABLE gameData ADD CONSTRAINT nameViolation CHECK(game_name NOT ILIKE '%new%' AND game_name NOT ILIKE '%gameeditor%' AND game_name NOT ILIKE '' AND game_name NOT ILIKE 'undefined' AND game_name NOT ILIKE '%null%');