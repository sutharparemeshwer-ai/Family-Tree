-- Memories Table Schema
CREATE TABLE memories (
    id SERIAL PRIMARY KEY,
    tree_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Files Table Schema
CREATE TABLE memory_files (
    id SERIAL PRIMARY KEY,
    memory_id INTEGER NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL -- 'image' or 'video'
);

-- Add comments to explain the tables and columns
COMMENT ON TABLE memories IS 'Stores memories (events, stories) associated with family members.';
COMMENT ON COLUMN memories.member_id IS 'The family member this memory belongs to.';

COMMENT ON TABLE memory_files IS 'Stores file references (photos, videos) for each memory.';
COMMENT ON COLUMN memory_files.file_type IS 'The type of the media file, e.g., ''image'' or ''video''.';
