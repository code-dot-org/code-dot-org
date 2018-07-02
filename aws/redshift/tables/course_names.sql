DROP TABLE IF EXISTS analysis.course_names CASCADE;

CREATE TABLE analysis.course_names
(
   versioned_course_id    integer,
   versioned_course_name  varchar(256),
   course_name_short      varchar(256),
   course_name_long       varchar(256)
);

INSERT INTO analysis.course_names values
(14,'csd-2017','csd','CS Discoveries'),
(15,'csp-2017','csp','CS Principles'),
(22,'csd-2018','csd','CS Discoveries'),
(23,'csp-2018','csp','CS Principles');

GRANT SELECT ON analysis.course_names TO group reader;
GRANT SELECT, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON analysis.course_names TO group admin;
GRANT SELECT ON analysis.course_names TO group reader_pii;

COMMIT;
