-- THINGS TO CHECK:
-- Are the lists of script ids still up-to-date (especially th HOC list?)

-- No check on whether students actually made progress

DROP TABLE IF EXISTS analysis.school_activity_stats;
CREATE TABLE analysis.school_activity_stats AS
  
WITH pledged as (
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
  -- by school ID, did a school host an hour of code in 2017?
    select distinct json_extract_path_text(data_text, 'nces_school_s') school_id
    from pegasus_pii.forms
    where kind = 'HocSignup2017'
    and json_extract_path_text(data_text, 'nces_school_s') not in ('','-1')
  ),
csf_script_ids as
  (select  
    sc.id as script_id,
    coalesce(sn.script_name_short, sc.name) script_name
    FROM 
    dashboard_production.scripts sc
    left join analysis.script_names sn on sn.versioned_script_id = sc.id
  where 
    sc.name in 
    (
      '20-hour',
      'course1',
      'course2',
      'course3',
      'course4'
    )
    or sn.script_name_long in 
    (
      'Course A',
      'Course B',
      'Course C',
      'Course D',
      'Course E',
      'Course F',
      'Express',
      'Pre-Express'
    )
   )
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
         -- teacher counts
         COUNT(DISTINCT u.studio_person_id) teachers,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN u.studio_person_id ELSE NULL END) teachers_l365,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select script_id from csf_script_ids) THEN u.studio_person_id ELSE NULL END) teachers_csf_l365,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select distinct script_id from analysis.course_structure where course_name_short in ('csd')) THEN u.studio_person_id ELSE NULL END) teachers_csd_l365,          
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select distinct script_id from analysis.course_structure where course_name_short in ('csp')) THEN u.studio_person_id ELSE NULL END) teachers_csp_l365,
         -- pd'd teacher counts
         COUNT(DISTINCT CASE WHEN ttf.user_id IS NOT NULL THEN ttf.user_id ELSE NULL END) teachers_csf_pd,        
         COUNT(DISTINCT CASE WHEN ttpd.studio_person_id IS NOT NULL AND ttpd.course = 'CS Discoveries' THEN ttpd.studio_person_id ELSE NULL END) teachers_csd_pd,
         COUNT(DISTINCT CASE WHEN ttpd.studio_person_id IS NOT NULL AND ttpd.course = 'CS Principles' THEN ttpd.studio_person_id ELSE NULL END) teachers_csp_pd,
         --student counts
         COUNT(DISTINCT f.student_user_id) students_code,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) THEN f.student_user_id ELSE NULL END) students_l365,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select script_id from csf_script_ids) THEN f.student_user_id ELSE NULL END) students_csf_l365,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select distinct script_id from analysis.course_structure where course_name_short in ('csd')) THEN f.student_user_id ELSE NULL END) students_csd_l365,
         COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND se.script_id IN (select distinct script_id from analysis.course_structure where course_name_short in ('csp')) THEN f.student_user_id ELSE NULL END) students_csp_l365,      
         COUNT(DISTINCT CASE WHEN scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro') THEN f.student_user_id ELSE NULL END) students_hoc,
         -- pledge and HOC
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
    LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm -- only major  change from the previous version (besides adding CSD)
      ON rpm.state = ss.state OR rpm.zip_code = ss.zip
    LEFT JOIN dashboard_production_pii.regional_partners rp 
      ON rp.id = rpm.regional_partner_id
    LEFT JOIN analysis.csp_csd_teachers_trained ttpd -- replaces join on 'regional partner stats' (both serve purpose of getting the number of CSD and CSP teachers trained)
      ON ttpd.studio_person_id = u.studio_person_id 
    LEFT JOIN analysis.csf_teachers_trained ttf -- additional table to get csf data 
      ON ttf.user_id = u.id
    LEFT JOIN pledged
      ON pledged.school_id = ss.school_id
    LEFT JOIN hoc_event
        ON hoc_event.school_id = ss.school_id
  GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
 ;
 
GRANT ALL PRIVILEGES ON analysis.school_activity_stats TO GROUP admin;
GRANT SELECT ON analysis.school_activity_stats TO GROUP reader, GROUP reader_pii;
