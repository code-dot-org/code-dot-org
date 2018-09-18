DROP TABLE if exists analysis_pii.regional_partner_stats_for_roster;

CREATE TABLE analysis_pii.regional_partner_stats_for_roster
AS
WITH csf_courses -- creates a list of the CSF courses a person taught
AS
(SELECT studio_person_id,
       school_year_trained AS school_year,
       school_year_taught,
       listagg(CASE WHEN script_name LIKE 'course%' THEN UPPER(SUBSTRING(script_name,7,1)) ELSE script_name END,', ') WITHIN GROUP(ORDER BY script_name)::VARCHAR(400) AS csf_scripts
FROM (SELECT DISTINCT studio_person_id,
             school_year_trained,
             school_year_taught,
             script_name
      FROM analysis_pii.regional_partner_stats_csf -- WARNING: this table includes teachers who were trained by facilitators prior to a RP taking over, but they are not included in query   
      WHERE school_year_trained = school_year_taught
      AND   trained_by_regional_partner = 1 -- the roster will only show PII of teachers who are trained by the RP)
      AND   len(script_name) > 1)

GROUP BY 1,
         2,
         3)
-- CSP/D SELECT
(SELECT regional_partner_id,
             regional_partner_name,
             school_year_trained,
             first_name,
             last_name,
             studio_person_id,
             email,
             CASE
               WHEN course = 'CS Principles' THEN 'CSP'
               WHEN course = 'CS Discoveries' THEN 'CSD'
             END AS course,
             school_name,
             students,
             sections,
             started::INTEGER,
             completed::INTEGER,
             script_most_progress::VARCHAR(10) AS most_students,
             q1::INTEGER,
             q2::INTEGER,
             q3::INTEGER,
             q4::INTEGER
      FROM analysis_pii.regional_partner_stats_csp_csd
      WHERE school_year_taught = school_year_trained OR school_year_taught is null)
      
UNION ALL
-- CSF SELECT
(SELECT regional_partner_id,
       regional_partner_name,
       rps.school_year_trained,
       first_name,
       last_name,
       rps.studio_person_id,
       MAX(email),
       MAX(CASE WHEN csf_courses.csf_scripts IS NULL THEN 'CSF' ELSE concat ('CSF ',csf_courses.csf_scripts) END) AS course,
       MAX(school_name),
       SUM(students_in_course),
       SUM(sections_of_course),
       MAX(started)::INTEGER,
       MAX(completed)::INTEGER,
       MAX(stage_number_most_progress)::VARCHAR(10) AS most_students,
       NULL::INTEGER AS q1,
       NULL::INTEGER AS q2,
       NULL::INTEGER AS q3,
       NULL::INTEGER AS q4
FROM analysis_pii.regional_partner_stats_csf rps -- this table DOES include teachers who were trained by facilitators prior to RP taking over
  LEFT JOIN csf_courses
         ON csf_courses.school_year = rps.school_year_trained
        AND csf_courses.studio_person_id = rps.studio_person_id
WHERE (rps.school_year_taught = rps.school_year_trained OR rps.school_year_taught is null)
AND trained_by_regional_partner = 1
GROUP BY 1,
         2,
         3,
         4,
         5,
         6);

GRANT ALL PRIVILEGES
  ON analysis_pii.regional_partner_stats_for_roster
  TO GROUP admin;

GRANT SELECT
  ON analysis_pii.regional_partner_stats_for_roster
  TO GROUP reader, GROUP reader_pii;
