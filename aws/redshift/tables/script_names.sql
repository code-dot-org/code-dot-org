DROP TABLE IF EXISTS analysis.script_names CASCADE;

CREATE TABLE analysis.script_names
(
   versioned_script_id    integer,
   versioned_script_name  varchar(24),
   script_name_short      varchar(16),
   script_name_long       varchar(16)
);

INSERT INTO analysis.script_names values
-- unversioned courses
(17, NULL, 'course1', 'Course 1'),
(18, NULL, 'course2', 'Course 2'),	
(19, NULL, 'course3', 'Course 3'),
(23, NULL, 'course4', 'Course 4'), 
(218, NULL, 'coursed-ramp', 'Course D Ramp' ),
(220, NULL, 'coursee-ramp', 'Course E Ramp' ),
(227, NULL, 'coursef-ramp', 'Course F Ramp' ),	
-- versioned courses: CSF
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
(341,'pre-express-2018','pre-express','Pre-Express'),
(369, 'coursea-2019','coursea','Course A'),
(370, 'courseb-2019','courseb','Course B'),
(366, 'coursec-2019','coursec','Course C'),
(360, 'coursed-2019','coursed','Course D'),
(361, 'coursee-2019','coursee','Course E'),
(357, 'coursef-2019', 'coursef','Course F'),
(363, 'express-2019', 'express','Express'),
(371, 'pre-express-2019', 'pre-express','Pre-Express'),
-- versioned courses: CSD
(181	,	'csd1-2017'	,	'csd1'	,	'CSD Unit 1'),
(312	,	'csd1-2018'	,	'csd1'	,	'CSD Unit 1'),
(362	,	'csd1-2019'	,	'csd1'	,	'CSD Unit 1'),
(187	,	'csd2-2017'	,	'csd2'	,	'CSD Unit 2'),
(298	,	'csd2-2018'	,	'csd2'	,	'CSD Unit 2'),
(374	,	'csd2-2019'	,	'csd2'	,	'CSD Unit 2'),
(169	,	'csd3-2017'	,	'csd3'	,	'CSD Unit 3'),
(299	,	'csd3-2018'	,	'csd3'	,	'CSD Unit 3'),
(375	,	'csd3-2019'	,	'csd3'	,	'CSD Unit 3'),
(189	,	'csd4-2017'	,	'csd4'	,	'CSD Unit 4'),
(313	,	'csd4-2018'	,	'csd4'	,	'CSD Unit 4'),
(376	,	'csd4-2019'	,	'csd4'	,	'CSD Unit 4'),
(223	,	'csd5-2017'	,	'csd5'	,	'CSD Unit 5'),
(314	,	'csd5-2018'	,	'csd5'	,	'CSD Unit 5'),
(377	,	'csd5-2019'	,	'csd5'	,	'CSD Unit 5'),
(221	,	'csd6-2017'	,	'csd6'	,	'CSD Unit 6'),
(308	,	'csd6-2018'	,	'csd6'	,	'CSD Unit 6'),
(378	,	'csd6-2019'	,	'csd6'	,	'CSD Unit 6'),
-- versioned courses: CSP
(284	,	'csp-create-2017'	,	'csp-create'	,	'CSP Create'),
(315	,	'csp-create-2018'	,	'csp-create'	,	'CSP Create'),
(380	,	'csp-create-2019'	,	'csp-create'	,	'CSP Create'),
(285	,	'csp-explore-2017'	,	'csp-explore'	,	'CSP Explore'),
(316	,	'csp-explore-2018'	,	'csp-explore'	,	'CSP Explore'),
(381	,	'csp-explore-2019'	,	'csp-explore'	,	'CSP Explore'),
(122	,	'csp1-2017'	,	'csp1'	,	'CSP Unit 1'),
(311	,	'csp1-2018'	,	'csp1'	,	'CSP Unit 1'),
(382	,	'csp1-2019'	,	'csp1'	,	'CSP Unit 1'),
(123	,	'csp2-2017'	,	'csp2'	,	'CSP Unit 2'),
(317	,	'csp2-2018'	,	'csp2'	,	'CSP Unit 2'),
(383	,	'csp2-2019'	,	'csp2'	,	'CSP Unit 2'),
(124	,	'csp3-2017'	,	'csp3'	,	'CSP Unit 3'),
(318	,	'csp3-2018'	,	'csp3'	,	'CSP Unit 3'),
(384	,	'csp3-2019'	,	'csp3'	,	'CSP Unit 3'),
(262  ,	 'csp3-research-mxghyt'	,	'csp3'	,	'CSP Unit 3'),
(125	,	'csp4-2017'	,	'csp4'	,	'CSP Unit 4'),
(319	,	'csp4-2018'	,	'csp4'	,	'CSP Unit 4'),
(385	,	'csp4-2019'	,	'csp4'	,	'CSP Unit 4'),
(126	,	'csp5-2017'	,	'csp5'	,	'CSP Unit 5'),
(320	,	'csp5-2018'	,	'csp5'	,	'CSP Unit 5'),
(386	,	'csp5-2019'	,	'csp5'	,	'CSP Unit 5'),
(210,	'csppostap-2017', 'csppostap', 'CSP Post-AP'),
(321,	'csppostap-2018', 'csppostap', 'CSP Post-AP'),
(387,	'csppostap-2019', 'csppostap', 'CSP Post-AP')
;

GRANT SELECT ON analysis.script_names TO group reader;
GRANT SELECT, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON analysis.script_names TO group admin;
GRANT SELECT ON analysis.script_names TO group reader_pii;

COMMIT;
