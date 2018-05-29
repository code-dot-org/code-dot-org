DROP TABLE IF EXISTS course_names CASCADE;

CREATE TABLE course_names
(
   versioned_course_id    integer,
   versioned_course_name  varchar(256),
   course_name_short      varchar(256),
   course_name_long       varchar(256)
);

GRANT SELECT, UNKNOWN ON course_names TO group reader;
GRANT SELECT, UNKNOWN, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON course_names TO group admin;
GRANT SELECT, UNKNOWN ON course_names TO group reader_pii;

COMMIT;
