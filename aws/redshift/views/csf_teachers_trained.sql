create or replace view analysis.csf_teachers_trained as

WITH
  -- first: add in any teachers in the new PD attendance model
pd_workshop_based as
 ( 
 SELECT DISTINCT 
    pde.user_id, 
    min(pds.start)::date as trained_at, -- actual workshop date
    --pdw.ended_at as trained_at, -- workshop date used in accounting and reports from the online dashboard
    pdw.id as workshop_id,
    pdw.section_id as section_id
  FROM dashboard_production_pii.pd_enrollments pde
    JOIN dashboard_production_pii.pd_attendances pda ON pda.pd_enrollment_id = pde.id
    JOIN dashboard_production_pii.pd_workshops pdw ON pdw.id = pde.pd_workshop_id
  JOIN dashboard_production_pii.pd_sessions pds ON pds.pd_workshop_id = pdw.id
  WHERE course = 'CS Fundamentals'
  AND   (pdw.subject IN ( 'Intro Workshop', 'Intro', 'Deep Dive Workshop') or pdw.subject is null)
  AND pda.deleted_at is null
  GROUP BY user_id, workshop_id, section_id
), 

  -- second: find any teachers who attended a section used for CSF PD in the old data model
pegasus_form_based as
  (
  SELECT 
    f.student_user_id user_id,
    to_date(
      nullif(
        case json_extract_path_text( json_extract_array_element_text( json_extract_path_text( data_text, 'dates'), 0), 'date_s')
        when '08/10/2015' then '08/10/15' -- fix malformed data
        when '7/19/2016' then '07/19/16' -- fix malformed data
        else json_extract_path_text( json_extract_array_element_text( json_extract_path_text( data_text, 'dates'), 0), 'date_s')
        end,
      ''),
    'MM/DD/YY'
    ) trained_at,
    null::int as workshop_id,
    se.id as section_id
  from pegasus_pii.forms
  join dashboard_production.sections se on se.id = nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int
  join dashboard_production.followers f on f.section_id = se.id
  where kind = 'ProfessionalDevelopmentWorkshop'
  and nullif(json_extract_path_text(data_text, 'section_id_s'),'') is not null
  ),
  

  -- third: add in any teachers in sections that aren't in the forms table, but are labeled "csf_workshop"
section_based as  
  (SELECT DISTINCT 
    f.student_user_id user_id, 
    date_trunc('day', se.created_at)::date trained_at,
    null::int as workshop_id,
    se.id as section_id
  FROM dashboard_production.followers f
    JOIN dashboard_production.sections se ON se.id = f.section_id
  WHERE se.section_type = 'csf_workshop'
  AND se.id NOT IN (select section_id from pegasus_form_based where section_id is not null)
  AND se.id NOT IN (select section_id from pd_workshop_based where section_id is not null)
  )



SELECT * FROM pd_workshop_based

UNION ALL

SELECT * FROM pegasus_form_based

UNION ALL 

SELECT * FROM section_based

with no schema binding;


GRANT ALL PRIVILEGES ON analysis.csf_teachers_trained TO GROUP admin;
GRANT SELECT ON analysis.csf_teachers_trained TO GROUP reader, GROUP reader_pii;
