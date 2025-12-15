-- Posts Table (News Feed)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    tree_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL, -- Who posted this (from Profile Selector)
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table (For Memories)
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL, -- Who commented (from Profile Selector)
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE posts IS 'Text updates/posts for the family news feed.';
COMMENT ON TABLE comments IS 'Discussion comments on specific memories.';
