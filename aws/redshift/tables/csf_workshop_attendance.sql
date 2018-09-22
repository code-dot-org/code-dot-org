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
  where (se.section_type = 'csf_workshop') or (se.id in (select distinct se.id from pegasus_pii.forms
     join dashboard_production.sections se on se.id = nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int
     join dashboard_production.followers f on f.section_id = se.id
     where kind = 'ProfessionalDevelopmentWorkshop'
     and nullif(json_extract_path_text(data_text, 'section_id_s'),'') is not null))

),

sections_geos AS (
SELECT se.id, 
CASE WHEN se.user_id = 1423830 then 'OH' ELSE ug.state END as state, -- 1423830 is only facilitator in this list not with user_geos in the US 
CASE WHEN se.user_id = 1423830 then '44113' ELSE ug.postal_code END as zip 
FROM dashboard_production.sections se 
JOIN dashboard_production_pii.user_geos ug
 ON se.user_id = ug.user_id
where ((se.section_type = 'csf_workshop') or (se.id in (select distinct se.id from pegasus_pii.forms
  join dashboard_production.sections se on se.id = nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int
  join dashboard_production.followers f on f.section_id = se.id
  where kind = 'ProfessionalDevelopmentWorkshop'
  and nullif(json_extract_path_text(data_text, 'section_id_s'),'') is not null)))
and se.id not in (SELECT id from sections_schools)
--and ug.country = 'United States'
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
         CASE WHEN subject in ('Intro Workshop', 'Intro') then 'Intro Workshop' ELSE pdw.subject END as subject,
         min(pds.start) as workshop_date,
         date_part(month, workshop_date) month_workshop,
         date_part(dayofweek, workshop_date) day_of_week_workshop,
         date_part(hour, workshop_date) hour_workshop, 
         CASE WHEN pdw.on_map = 1 THEN 'Public' WHEN pdw.on_map = 0 THEN 'Private' ELSE null END as audience,
         pdw.funded,
         pdw.funding_type,
         capacity,
         CASE WHEN pdw.regional_partner_id IS NOT NULL THEN 1 ELSE 0 END AS trained_by_regional_partner,
         CASE WHEN rp.name IS NOT NULL THEN rp.name ELSE 'No Partner' END as regional_partner_name,
         coalesce (pdw.regional_partner_id, rpm.regional_partner_id) AS regional_partner_id,
         wsz.zip as zip,
         coalesce(sa.state_abbreviation, wsz.state) as state,
         u.name as facilitator_name,
         u.studio_person_id as studio_person_id_facilitator,
         pdf.user_id as facilitator_id,
         sy.school_year,
         min(CASE WHEN pds.start < DATEADD(day,-3,GETDATE()) and pda.id is null then 1 else 0 END) as not_attended
   FROM  dashboard_production_pii.pd_workshops pdw 
   JOIN dashboard_production_pii.pd_sessions pds 
      ON pdw.id = pds.pd_workshop_id  
   LEFT JOIN dashboard_production_pii.pd_enrollments pde
      ON pdw.id = pde.pd_workshop_id
   LEFT JOIN dashboard_production_pii.pd_attendances pda 
       ON pde.id = pda.pd_enrollment_id
   LEFT JOIN dashboard_production_pii.pd_workshops_facilitators pdf
       ON pdw.id = pdf.pd_workshop_id
   LEFT JOIN dashboard_production_pii.users u
       ON u.id = pdf.user_id
   LEFT JOIN analysis.training_school_years sy ON pds.start BETWEEN sy.started_at AND sy.ended_at
   LEFT JOIN workshop_state_zip wsz 
      ON wsz.id = pdw.id
   LEFT JOIN analysis.state_abbreviations sa
      ON sa.state_name = wsz.state OR sa.state_abbreviation = wsz.state
   LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = sa.state_abbreviation OR rpm.zip_code = wsz.zip
   LEFT JOIN dashboard_production_pii.regional_partners rp  
      ON rpm.regional_partner_id = rp.id  
  WHERE pdw.course = 'CS Fundamentals'
  AND   pdw.subject IN ( 'Intro Workshop', 'Intro', 'Deep Dive Workshop')
  group by 1, 2, 3, 4,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
  
UNION ALL 

    SELECT f.student_user_id user_id,
         'CS Fundamentals' as course,
         se.id as workshop_id, -- is workshop id in the other table (above)
         'Intro Workshop' as subject,
         se.created_at as workshop_date,
         date_part(month, workshop_date) month_workshop,
         date_part(dayofweek, workshop_date) day_of_week_workshop,
         date_part(hour, workshop_date) hour_workshop, 
         JSON_EXTRACT_PATH_TEXT(forms.data_text,'type_s') as audience,
         null as funded,
         null as funding_type,
         case when trim(JSON_EXTRACT_PATH_TEXT(forms.data_text,'capacity_s')) ~ '^[0-9]+$' then trim(JSON_EXTRACT_PATH_TEXT(forms.data_text,'capacity_s'))  else null  end::int as capacity,
         0 AS trained_by_regional_partner,
         CASE WHEN rp.name IS NOT NULL THEN rp.name ELSE 'No Partner' END as regional_partner_name,
         rpm.regional_partner_id AS regional_partner_id,
         ssz.zip as zip,
         coalesce(sa.state_abbreviation, ssz.state) as state,
         coalesce(u.name, forms.name) as facilitator_name,
         u.studio_person_id as studio_person_id_facilitator,
         se.user_id as facilitator_id,
         sy.school_year, 
         0 as not_attended
    FROM dashboard_production.followers f
    JOIN dashboard_production.sections se 
       ON se.id = f.section_id 
    JOIN dashboard_production_pii.users u 
       ON u.id = se.user_id
    JOIN analysis.training_school_years sy ON se.created_at BETWEEN sy.started_at AND sy.ended_at
    JOIN section_state_zip ssz 
      ON ssz.id = se.id
    LEFT JOIN analysis.state_abbreviations sa
      ON sa.state_name = ssz.state OR sa.state_abbreviation = ssz.state
    LEFT JOIN pegasus_pii.forms on ssz.id = nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int 
    LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = sa.state_abbreviation OR rpm.zip_code = ssz.zip 
    LEFT JOIN dashboard_production_pii.regional_partners rp  
      ON rpm.regional_partner_id = rp.id 

;

GRANT ALL PRIVILEGES
  ON analysis.csf_workshop_attendance
  TO GROUP admin;

GRANT SELECT
  ON analysis.csf_workshop_attendance
  TO GROUP reader, GROUP reader_pii;
