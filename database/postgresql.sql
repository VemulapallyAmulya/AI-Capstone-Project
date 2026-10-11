CREATE DATABASE readnest;

CREATE TABLE book (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    description TEXT,
    cover VARCHAR(500)
);
