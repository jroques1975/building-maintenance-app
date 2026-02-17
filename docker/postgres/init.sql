-- Initialize database with extensions and basic setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create additional roles if needed
-- CREATE ROLE readonly;
-- CREATE ROLE readwrite;

-- Grant permissions
-- GRANT CONNECT ON DATABASE building_maintenance TO readonly, readwrite;