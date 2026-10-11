-- Optional PostgreSQL schema for ReadNest
-- The default project uses H2 so no database installation is required.

CREATE DATABASE readnest;

-- After connecting to readnest:
CREATE TABLE book (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    description TEXT,
    cover VARCHAR(500)
);
