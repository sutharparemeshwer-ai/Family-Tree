-- Add gender column to family_members table
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add comment to explain the column
COMMENT ON COLUMN family_members.gender IS 'Gender: male, female, or null';

