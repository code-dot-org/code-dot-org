DROP TABLE if exists analysis.csf_workshop_attendance;

CREATE TABLE analysis.csf_workshop_attendance 
AS
WITH zip_processed
AS
(
-- get state for entries where formatted_address looks like
-- "formatted_address":"1516 N 35th Ave, Phoenix, AZ 85009, USA"
-- better than taking first two character capitol letters to avoid "SE 53rd St"
SELECT id,
       processed_location,
       SUBSTRING(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),2,2) AS state,
       SUBSTRING(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),5,5) AS zip
FROM dashboard_production_pii.pd_workshops
WHERE course = 'CS Fundamentals'
AND   regexp_instr(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),'[0-9][0-9][0-9][0-9][0-9]') != 0
),

other_processed AS (
-- get state for entries where processed_location looks like
-- {"latitude":47.6062095,"longitude":-122.3320708,"city":"Seattle","state":"Washington","formatted_address":"Seattle, WA, USA"}
-- or
-- {"latitude":30.267153,"longitude":-97.7430608,"formatted_address":"Austin, TX, USA"}
SELECT id,
  processed_location,
  CASE
  WHEN json_extract_path_text(processed_location, 'state') != '' THEN json_extract_path_text(processed_location, 'state')
  ELSE regexp_substr(
    json_extract_path_text(processed_location, 'formatted_address')
  , '[A-Z][A-Z]')
  END AS state,
  regexp_substr(
    json_extract_path_text(processed_location, 'formatted_address')
  , '[0-9][0-9][0-9][0-9][0-9]', -15)
   AS zip
  
FROM dashboard_production_pii.pd_workshops
WHERE course = 'CS Fundamentals'
AND id NOT IN (SELECT id FROM zip_processed)),

workshop_state_zip AS
(
SELECT *
FROM zip_processed

UNION ALL

SELECT *
FROM other_processed
),

sections_schools AS(
SELECT se.id, ss_user.state as state, ss_user.zip as zip

  FROM dashboard_production.sections se 
  JOIN dashboard_production_pii.users u  -- users just needed to get school_info_id
         ON se.user_id = u.id
  JOIN dashboard_production.school_infos si_user
         ON si_user.id = u.school_info_id
  JOIN analysis.school_stats ss_user
         ON ss_user.school_id = si_user.school_id
  where se.section_type = 'csf_workshop'

),

sections_geos AS (
SELECT se.id, ug.state as state, ug.postal_code as zip 
FROM dashboard_production.sections se 
JOIN user_geos ug
 ON se.user_id = ug.user_id
where se.section_type = 'csf_workshop'
and se.id not in (SELECT id from sections_schools)
and ug.country = 'United States'
),

section_state_zip AS (

SELECT *
FROM sections_schools

UNION ALL

SELECT *
FROM sections_geos

)

  SELECT pde.user_id as user_id,
         pdw.course as course,
         pdw.id AS workshop_id, -- section_id in the other table (below)
         pdw.subject as subject,
         pdw.started_at as started_at,
         CASE WHEN pdw.regional_partner_id IS NOT NULL THEN 1 ELSE 0 END AS trained_by_regional_partner,
         coalesce (pdw.regional_partner_id, rpm.regional_partner_id) AS regional_partner_id,
         sy.school_year
   FROM dashboard_production_pii.pd_enrollments pde
     JOIN dashboard_production_pii.pd_attendances pda 
       ON pda.pd_enrollment_id = pde.id
     JOIN dashboard_production_pii.pd_workshops pdw 
       ON pdw.id = pde.pd_workshop_id
     JOIN dashboard_production_pii.pd_sessions pds 
       ON pds.pd_workshop_id = pdw.id
    JOIN analysis.training_school_years sy ON pds.start BETWEEN sy.started_at AND sy.ended_at
    JOIN workshop_state_zip wsz 
      ON wsz.id = pdw.id
    LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = wsz.state OR rpm.zip_code = wsz.zip
  WHERE pdw.course = 'CS Fundamentals'
  AND   pdw.subject IN ( 'Intro Workshop','Deep Dive Workshop')
  
UNION ALL 

    SELECT f.student_user_id user_id,
         'CS Fundamentals' as course,
         se.id as workshop_id, -- is workshop id in the other table (above)
         'Intro Workshop' as subject,
         se.created_at as started_at,
         0 AS trained_by_regional_partner,
         rpm.regional_partner_id AS regional_partner_id,
         sy.school_year
    FROM dashboard_production.followers f
    JOIN dashboard_production.sections se 
       ON se.id = f.section_id AND se.section_type = 'csf_workshop' 
    JOIN analysis.training_school_years sy ON se.created_at BETWEEN sy.started_at AND sy.ended_at
    JOIN section_state_zip ssz 
      ON ssz.id = se.id
    LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = ssz.state OR rpm.zip_code = ssz.zip 

;

GRANT ALL PRIVILEGES
  ON analysis.csf_workshop_attendance
  TO GROUP admin;

GRANT SELECT
  ON analysis.csf_workshop_attendance
  TO GROUP reader, GROUP reader_pii;


