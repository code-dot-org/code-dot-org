DROP TABLE IF EXISTS analysis.script_names CASCADE;

CREATE TABLE analysis.script_names
(
   versioned_script_id    integer,
   versioned_script_name  varchar(16),
   script_name_short      varchar(16),
   script_name_long       varchar(16)
);

INSERT INTO analysis.script_names values
(236,'coursea-2017','coursea','Course A'),
(237,'courseb-2017','courseb','Course B'),
(238,'coursec-2017','coursec','Course C'),
(239,'coursed-2017','coursed','Course D'),
(240,'coursee-2017','coursee','Course E'),
(241,'coursef-2017','coursef','Course F'),
(258,'express-2017','express','Express'),
(259,'pre-express-2017','pre-express','Pre-Express'),
(297,'coursea-2018','coursea','Course A'),
(301,'courseb-2018','courseb','Course B'),
(307,'coursec-2018','coursec','Course C'),
(302,'coursed-2018','coursed','Course D'),
(309,'coursee-2018','coursee','Course E'),
(310,'coursef-2018','coursef','Course F'),
(303,'express-2018','express','Express'),
(341,'pre-express-2018','pre-express','Pre-Express');

GRANT SELECT ON analysis.script_names TO group reader;
GRANT SELECT, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON analysis.script_names TO group admin;
GRANT SELECT ON analysis.script_names TO group reader_pii;

COMMIT;
