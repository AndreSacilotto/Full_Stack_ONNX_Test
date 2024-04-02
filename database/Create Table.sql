-- CREATE DATABASE overview
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Portuguese_Brazil.1252'
--     LC_CTYPE = 'Portuguese_Brazil.1252'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;

DROP TABLE video_analyses;

CREATE TABLE video_analyses (
    id SERIAL PRIMARY KEY,
    file_time REAL NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    input_confidence REAL NOT NULL,
    input_iou REAL NOT NULL,
    model VARCHAR(100) NOT NULL
--     predictions JSON NOT NULL
);

-- INSERT INTO video_analyses (file_time, file_name, input_confidence, input_iou, model, predictions) 
-- VALUES (10.083, 'Banana.mp4', 0.7, 0.5, 'yolo', '{ "a": "b" }'::json);