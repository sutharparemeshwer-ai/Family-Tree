CREATE TABLE share_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    tree_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'view', -- 'view' or 'edit'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE share_tokens IS 'Stores unique tokens for sharing family trees.';
