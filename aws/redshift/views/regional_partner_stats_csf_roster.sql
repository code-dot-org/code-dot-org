DROP VIEW IF EXISTS analysis_pii.regional_partner_stats_csf_roster_view CASCADE;

-- CSF Roster Info
CREATE OR REPLACE VIEW analysis_pii.regional_partner_stats_csf_roster_view
AS
WITH csf_courses -- creates a list of the CSF courses a person taught
AS
(SELECT studio_person_id,
       school_year_trained AS school_year,
       school_year_taught,
       listagg(CASE WHEN script_name LIKE 'course%' THEN UPPER(SUBSTRING(script_name,7,1)) ELSE script_name END,', ') WITHIN GROUP(ORDER BY script_name) AS csf_scripts
FROM (SELECT DISTINCT studio_person_id,
             school_year_trained,
             school_year_taught,
             script_name
      FROM analysis_pii.regional_partner_stats_csf_view -- WARNING: this table includes teachers who were trained by facilitators prior to a RP taking over, but they are not included in query   
      WHERE school_year_trained = school_year_taught
      AND   trained_by_regional_partner = 1 -- the roster will only show PII of teachers who are trained by the RP)
      AND   len(script_name) > 1)

GROUP BY 1,
         2,
         3),
         
existing_deep_dive_teachers as
(select user_id 
from analysis.csf_teachers_trained 
where subject = 'Deep Dive')
      
SELECT regional_partner_id,
       regional_partner_name,
       rps.school_year_trained,
       first_name,
       last_name,
       rps.studio_person_id,
       MIN(case 
          WHEN (days_to_start is not null) and (edd.user_id is null) then 0 -- definitely eligible
          WHEN edd.user_id is not null THEN 1 -- already done deep dive
          ELSE 2 -- unknown whether they have started
          END::smallint) as deep_dive_status,
       MAX(rps.email) email,
       MAX(CASE WHEN csf_courses.csf_scripts IS NULL THEN 'CSF' ELSE concat ('CSF ',csf_courses.csf_scripts) END) AS course,
       MAX(school_name) as school_name,
       MAX(school_district_name) as school_district_name,
       SUM(students_in_course) as students_in_course,
       SUM(sections_of_course) as sections_of_course,
       MAX(started) as started,
       MAX(completed) as completed,
       MAX(stage_number_most_progress) AS most_students,
       NULL::INTEGER AS q1,
       NULL::INTEGER AS q2,
       NULL::INTEGER AS q3,
       NULL::INTEGER AS q4
FROM analysis_pii.regional_partner_stats_csf_view rps -- this table DOES include teachers who were trained by facilitators prior to RP taking over
  LEFT JOIN csf_courses
         ON csf_courses.school_year = rps.school_year_trained
        AND csf_courses.studio_person_id = rps.studio_person_id
  JOIN dashboard_production.users u 
         ON u.studio_person_id = rps.studio_person_id
  LEFT JOIN existing_deep_dive_teachers edd
         ON edd.user_id = u.id
WHERE (rps.school_year_taught = rps.school_year_trained OR rps.school_year_taught is null)
AND trained_by_regional_partner = 1
GROUP BY 1,
         2,
         3,
         4,
         5,
         6
with no schema binding;

GRANT SELECT ON analysis_pii.regional_partner_stats_csf_roster_view TO reader_pii;
GRANT SELECT ON analysis_pii.regional_partner_stats_csf_roster_view TO reader;
GRANT TRIGGER, UPDATE, SELECT, INSERT, RULE, DELETE, REFERENCES ON analysis_pii.regional_partner_stats_csf_roster_view TO mary;
GRANT REFERENCES, TRIGGER, UPDATE, SELECT, INSERT, RULE, DELETE ON analysis_pii.regional_partner_stats_csf_roster_view TO admin;


select top 10 * from regional_partner_stats_csf_roster_view;
