
CREATE TYPE AccessLevel AS ENUM ('READ', 'WRITE', 'ADMIN');

CREATE TYPE Visibility AS ENUM (  'PRIVATE', 'PUBLIC', 'RESTRICTED');

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    -- theme VARCHAR(20) DEFAULT 'light',
    preferred_language VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT DEFAULT '',
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'typescript',
    visibility TEXT NOT NULL DEFAULT 'private', 
    share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Operations (for CRDT/OT logs)
-- CREATE TABLE IF NOT EXISTS operations (
--     id SERIAL PRIMARY KEY,
--     document_id INT REFERENCES documents(id) ON DELETE CASCADE,
--     user_id INT REFERENCES users(id) ON DELETE SET NULL,
--     op JSONB NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Permissions (doc sharing)
CREATE TABLE IF NOT EXISTS membership (
    id SERIAL PRIMARY KEY,
    document_id INT REFERENCES documents(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    access_level AccessLevel DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, user_id)
);
