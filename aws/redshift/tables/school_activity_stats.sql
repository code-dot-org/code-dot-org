-- the overall goal of this table is to represent key metrics of engagement with code.org on a per-school level
drop table if exists analysis.school_activity_stats;
create table analysis.school_activity_stats as
-- which schools have we received an Access Report submission from someone where they pledged to expand CS at the school?
with pledged as
(
  select distinct si.school_id, 1 as pledged
  from dashboard_production_pii.census_submissions cs
    join dashboard_production.census_submissions_school_infos cssi on cssi.census_submission_id = cs.id
    join dashboard_production.school_infos si on si.id = cssi.school_info_id
  where pledged = 1
),
-- which schools hosted an HoC event?
-- filters to appropriate signups based on the following
-- will show, for example, HocSignup2019 from July 1, 2019-June 30, 2020
hoc_event as
(
  select distinct
    json_extract_path_text(data_text, 'nces_school_s') school_id,
    1 as hoc_event
  from pegasus_pii.forms
  where left(kind, 9) = 'HocSignup'
  and right(kind, 4) = (select school_year_int from analysis.school_years where getdate() between started_at and ended_at)
  and json_extract_path_text(data_text, 'nces_school_s') not in ('','-1')
),
-- which schools have had someone already apply to CSP or CSD PD?
-- starts showing applications for the 2020-2021 application cycle
-- on January 1, 2020
applied_to_csp_csd_pd as
(
  select distinct
    json_extract_path_text(form_data, 'school') school_id,
    1 as applied_to_csp_csd_pd
  from dashboard_production_pii.pd_applications
  where left(application_year, 4)::int = date_part_year(getdate()::date)
  and application_type = 'Teacher'
  and json_extract_path_text(form_data, 'school') != '-1'
),
-- get list of CSF script IDs, used to determine number of CSF students and teachers
csf_script_ids as
(
  select
    sc.id as script_id,
    coalesce(sn.script_name_short, sc.name) script_name
  FROM dashboard_production.scripts sc
    left join analysis.script_names sn on sn.versioned_script_id = sc.id
  where sc.name in
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
),
-- expensive subquery!
-- computes number of students and teachers for various courses by school
students_and_teachers as
(
  select
    si.school_id,
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
    COUNT(DISTINCT CASE WHEN u_students.current_sign_in_at >= dateadd (day,-364,getdate ()::DATE) AND scr.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro','aquatic','dance','dance-extras','dance-extras-2019','oceans') THEN f.student_user_id ELSE NULL END) students_hoc
  from dashboard_production_pii.users u
    JOIN dashboard_production.school_infos si
      ON u.school_info_id = si.id
    LEFT JOIN dashboard_production.sections se
      ON se.user_id = u.id
    LEFT JOIN dashboard_production.scripts scr
      ON scr.id = se.script_id
    LEFT JOIN dashboard_production.followers f
      ON f.section_id = se.id
    LEFT JOIN dashboard_production_pii.users u_students
      ON u_students.id = f.student_user_id AND u_students.current_sign_in_at IS NOT NULL
    LEFT JOIN analysis.csp_csd_teachers_trained ttpd
      ON ttpd.studio_person_id = u.studio_person_id
    LEFT JOIN analysis.csf_teachers_trained ttf
      ON ttf.user_id = u.id
  where si.school_id is not null
  and u.user_type = 'teacher'
  group by 1
)
SELECT
  ss.school_id,
  rpm.regional_partner_id::varchar,
  rp.name as regional_partner,
  ss.school_name,
  ss.city,
  ss.state,
  ss.zip,
  ss.school_type,
  ss.school_district_name,
  ss.stage_el AS elementary,
  ss.stage_mi AS middle,
  ss.stage_hi AS high,
  ss.grades_lo,
  ss.grades_hi,
  ss.frl_eligible as frl_eligible_count,
  ss.frl_eligible_percent,
  ss.urm_percent * ss.students as urm_count,
  ss.urm_percent,
  ss.high_needs,
  ss.rural,
  ss.students,
  ss.latitude,
  ss.longitude,
  sat.teachers,
  sat.teachers_l365,
  sat.teachers_csf_l365,
  sat.teachers_csd_l365,
  sat.teachers_csp_l365,
  -- pd'd teacher counts
  sat.teachers_csf_pd,
  sat.teachers_csd_pd,
  sat.teachers_csp_pd,
   --student counts
  sat.students_code,
  sat.students_l365,
  sat.students_csf_l365,
  sat.students_csd_l365,
  sat.students_csp_l365,
  sat.students_hoc,
   -- pledge and HOC
  pledged.pledged,
  hoc_event.hoc_event,
  app.applied_to_csp_csd_pd
FROM analysis.school_stats ss
  left join students_and_teachers sat on sat.school_id = ss.school_id
  LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm
    ON (rpm.state = ss.state OR rpm.zip_code = ss.zip) and rpm.deleted_at is null
  LEFT JOIN dashboard_production_pii.regional_partners rp
    ON rp.id = rpm.regional_partner_id
  LEFT JOIN pledged
    ON pledged.school_id = ss.school_id
  LEFT JOIN hoc_event
    ON hoc_event.school_id = ss.school_id
  LEFT JOIN applied_to_csp_csd_pd app
    ON app.school_id = ss.school_id;

GRANT all privileges ON analysis.school_activity_stats TO GROUP admin;
GRANT SELECT ON analysis.school_activity_stats TO GROUP reader_pii, GROUP reader;
