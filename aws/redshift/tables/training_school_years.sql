DROP TABLE IF EXISTS training_school_years CASCADE;

CREATE TABLE analysis.training_school_years
(
   school_year      varchar(256),
   school_year_int  integer,
   started_at       date,
   ended_at         date
);

GRANT SELECT ON analysis.training_school_years TO group reader;
GRANT SELECT, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON analysis.training_school_years TO group admin;
GRANT INSERT, TRIGGER, UPDATE, REFERENCES, RULE, DELETE, SELECT ON analysis.training_school_years TO dev;
GRANT SELECT ON analysis.training_school_years TO group reader_pii;

INSERT INTO analysis.training_school_years VALUES ('2013-14',	'2013',	'2013-06-01',	'2014-06-01');
INSERT INTO analysis.training_school_years VALUES ('2014-15',	'2014',	'2014-06-01',	'2015-06-01');
INSERT INTO analysis.training_school_years VALUES ('2015-16',	'2015',	'2015-06-01',	'2016-06-01');
INSERT INTO analysis.training_school_years VALUES ('2016-17',	'2016',	'2016-06-01',	'2017-06-01');
INSERT INTO analysis.training_school_years VALUES ('2017-18',	'2017',	'2017-06-01',	'2018-06-01');
INSERT INTO analysis.training_school_years VALUES ('2018-19',	'2018',	'2018-06-01',	'2019-06-01');
INSERT INTO analysis.training_school_years VALUES ('2019-20',	'2019',	'2019-06-01',	'2020-06-01');
