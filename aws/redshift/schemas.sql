CREATE SCHEMA analysis_pii;
GRANT ALL PRIVILEGES ON SCHEMA analysis_pii TO GROUP admin;
GRANT SELECT ON ALL TABLES IN SCHEMA analysis_pii TO GROUP reader_pii;

GRANT USAGE
ON SCHEMA analysis
TO GROUP reader, GROUP reader_pii, GROUP admin;

GRANT USAGE
ON SCHEMA analysis_pii
TO GROUP reader_pii, GROUP admin;
