-- No check on whether students actually made progress
-- Quick change: only include last year of activity
drop table if exists analysis.school_activity_stats;
CREATE table analysis.school_activity_stats AS
  WITH csf_pd as (
  -- distinct user IDs who have attended CSF PD.
    SELECT DISTINCT f.student_user_id user_id
    FROM dashboard_production.followers f
     JOIN dashboard_production.sections se 
       ON se.id = f.section_id
    WHERE se.section_type = 'csf_workshop'
    UNION
    SELECT DISTINCT pde.user_id
    FROM dashboard_production_pii.pd_enrollments pde
     JOIN dashboard_production_pii.pd_attendances pda 
       ON pda.pd_enrollment_id = pde.id
     JOIN dashboard_production_pii.pd_workshops pdw 
       ON pdw.id = pde.pd_workshop_id
    WHERE course = 'CS Fundamentals'
  ),
  pledged as (
  -- By school_id, has a school pledged to expand computer science?
    select distinct si.school_id
    from dashboard_production_pii.census_submissions cs
      join dashboard_production.census_submissions_school_infos cssi 
      on cssi.census_submission_id = cs.id
      join dashboard_production.school_infos si 
      on si.id = cssi.school_info_id
    where pledged = 1
  ),
  hoc_event as (
  -- by school ID, did a school host an hour of code?
    select distinct json_extract_path_text(data, 'nces_school_s') school_id
    from pegasus_pii.forms
    where kind = 'HocSignup2017'
    and json_extract_path_text(data, 'nces_school_s') not in ('','-1')
  )
  -- Schools in geographies where a regional partner is mapped to a zip code
  SELECT ss.school_id,
         rpm.regional_partner_id::varchar,
         case when rp.name = 'mindSpark Learning' then 'mindSpark Learning and Colorado Education Initiative' else rp.name end as regional_partner,
         ss.school_name,
         ss.city,
         ss.state,
         ss.zip,
         ss.school_type,
         ss.school_district_name,
         ss.stage_el AS elementary,
         ss.stage_mi AS middle,
         ss.stage_hi AS high,
         ss.frl_eligible_percent,
         ss.urm_percent,
         ss.students,
         sc.latitude,
         sc.longitude,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN se.user_id ELSE NULL END) teachers_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN se.user_id ELSE NULL END) teachers_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN se.user_id ELSE NULL END) teachers_csp,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Principles' THEN u.id ELSE NULL END) teachers_csp_pd,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Discoveries' THEN u.id ELSE NULL END) teachers_csd_pd,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN f.student_user_id ELSE NULL END) students_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN csf_pd.user_id IS NOT NULL THEN u.id ELSE NULL END) teachers_csf_pd,
         COUNT(DISTINCT CASE WHEN scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball') THEN f.student_user_id ELSE NULL END) students_hoc,
         MAX(CASE WHEN pledged.school_id is not null then 1 end) pledged,
         MAX(CASE WHEN hoc_event.school_id is not null then 1 end) as hoc_event
  FROM analysis.school_stats ss
    LEFT JOIN dashboard_production.schools sc on sc.id = ss.school_id
    LEFT JOIN dashboard_production.school_infos si 
      ON ss.school_id = si.school_id
    LEFT JOIN dashboard_production_pii.users u
      ON si.id = u.school_info_id AND u.user_type = 'teacher'
    LEFT JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    LEFT JOIN dashboard_production.scripts scr 
      ON scr.id = se.script_id
    LEFT JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    LEFT JOIN dashboard_production_pii.users u_students
      ON u_students.id = f.student_user_id AND u_students.current_sign_in_at IS NOT NULL
    JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.zip_code = ss.zip
    LEFT JOIN dashboard_production_pii.regional_partners rp 
      ON rp.id = rpm.regional_partner_id
    LEFT JOIN analysis_pii.regional_partner_stats rpd 
      ON rpd.user_id = u.id
    LEFT JOIN csf_pd 
      ON csf_pd.user_id = u.id
    LEFT JOIN pledged
      ON pledged.school_id = ss.school_id
    LEFT JOIN hoc_event
      ON hoc_event.school_id = ss.school_id
  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
  
union all

  -- Schools in geographies where a regional partner is mapped to a state
  SELECT ss.school_id,
         rpm.regional_partner_id::varchar,
         case when rp.name = 'mindSpark Learning' then 'mindSpark Learning and Colorado Education Initiative' else rp.name end as regional_partner,
         ss.school_name,
         ss.city,
         ss.state,
         ss.zip,
         ss.school_type,
         ss.school_district_name,
         ss.stage_el AS elementary,
         ss.stage_mi AS middle,
         ss.stage_hi AS high,
         ss.frl_eligible_percent,
         ss.urm_percent,
         ss.students,
         sc.latitude,
         sc.longitude,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN se.user_id ELSE NULL END) teachers_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN se.user_id ELSE NULL END) teachers_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN se.user_id ELSE NULL END) teachers_csp,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Principles' THEN u.id ELSE NULL END) teachers_csp_pd,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Discoveries' THEN u.id ELSE NULL END) teachers_csd_pd,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN f.student_user_id ELSE NULL END) students_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN csf_pd.user_id IS NOT NULL THEN u.id ELSE NULL END) teachers_csf_pd,
         COUNT(DISTINCT CASE WHEN scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball') THEN f.student_user_id ELSE NULL END) students_hoc,
         MAX(CASE WHEN pledged.school_id is not null then 1 end) pledged,
         MAX(CASE WHEN hoc_event.school_id is not null then 1 end) as hoc_event        
  FROM analysis.school_stats ss
    LEFT JOIN dashboard_production.schools sc on sc.id = ss.school_id
    LEFT JOIN dashboard_production.school_infos si 
      ON ss.school_id = si.school_id
    LEFT JOIN dashboard_production_pii.users u
      ON si.id = u.school_info_id AND u.user_type = 'teacher'
    LEFT JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    LEFT JOIN dashboard_production.scripts scr 
      ON scr.id = se.script_id
    LEFT JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    LEFT JOIN dashboard_production_pii.users u_students
      ON u_students.id = f.student_user_id AND u_students.current_sign_in_at IS NOT NULL
    JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = ss.state
    LEFT JOIN dashboard_production_pii.regional_partners rp 
      ON rp.id = rpm.regional_partner_id
    LEFT JOIN analysis_pii.regional_partner_stats rpd 
      ON rpd.user_id = u.id
    LEFT JOIN csf_pd 
      ON csf_pd.user_id = u.id
    LEFT JOIN pledged
      ON pledged.school_id = ss.school_id
    LEFT JOIN hoc_event
      ON hoc_event.school_id = ss.school_id
  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
  
union all

  -- Schools in geographies not mapped to a regional partner
  SELECT ss.school_id,
         NULL as regional_partner_id,
         NULL as regional_partner_name,
         ss.school_name,
         ss.city,
         ss.state,
         ss.zip,
         ss.school_type,
         ss.school_district_name,
         ss.stage_el AS elementary,
         ss.stage_mi AS middle,
         ss.stage_hi AS high,
         ss.frl_eligible_percent,
         ss.urm_percent,
         ss.students,
         sc.latitude,
         sc.longitude,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN se.user_id ELSE NULL END) teachers_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN se.user_id ELSE NULL END) teachers_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN se.user_id ELSE NULL END) teachers_csp,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Principles' THEN u.id ELSE NULL END) teachers_csp_pd,
         COUNT(DISTINCT CASE WHEN rpd.user_id IS NOT NULL AND rpd.course = 'CS Discoveries' THEN u.id ELSE NULL END) teachers_csd_pd,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN f.student_user_id ELSE NULL END) students_l365,
         COUNT(DISTINCT CASE WHEN se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) THEN f.student_user_id ELSE NULL END) students_csf,
         COUNT(DISTINCT CASE WHEN se.script_id IN (122,123,124,125,126,127) THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN csf_pd.user_id IS NOT NULL THEN u.id ELSE NULL END) teachers_csf_pd,
         COUNT(DISTINCT CASE WHEN scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball') THEN f.student_user_id ELSE NULL END) students_hoc,
         MAX(CASE WHEN pledged.school_id is not null then 1 end) pledged,
         MAX(CASE WHEN hoc_event.school_id is not null then 1 end) as hoc_event
  FROM analysis.school_stats ss
    LEFT JOIN dashboard_production.schools sc on sc.id = ss.school_id
    LEFT JOIN dashboard_production.school_infos si 
      ON ss.school_id = si.school_id
    LEFT JOIN dashboard_production_pii.users u
      ON si.id = u.school_info_id AND u.user_type = 'teacher'
    LEFT JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    LEFT JOIN dashboard_production.scripts scr 
      ON scr.id = se.script_id
    LEFT JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    LEFT JOIN dashboard_production_pii.users u_students
      ON u_students.id = f.student_user_id AND u_students.current_sign_in_at IS NOT NULL
    LEFT JOIN analysis_pii.regional_partner_stats rpd 
      ON rpd.user_id = u.id
    LEFT JOIN csf_pd 
      ON csf_pd.user_id = u.id
    LEFT JOIN pledged
      ON pledged.school_id = ss.school_id
    LEFT JOIN hoc_event
      ON hoc_event.school_id = ss.school_id
  WHERE ss.state not in (select state from dashboard_production_pii.pd_regional_partner_mappings where state is not null)
  AND ss.zip not in (select zip_code from dashboard_production_pii.pd_regional_partner_mappings where zip_code is not null)
  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17;

GRANT ALL PRIVILEGES ON analysis.school_activity_stats TO GROUP admin;
GRANT SELECT ON analysis.school_activity_stats TO GROUP reader, GROUP reader_pii;
