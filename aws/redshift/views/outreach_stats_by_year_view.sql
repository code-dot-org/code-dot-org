DROP VIEW IF EXISTS outreach_stats_by_year_view CASCADE;

CREATE OR REPLACE VIEW analysis.outreach_stats_by_year_view AS
with csf_script_ids as
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
  SELECT 'State' region_type,
         ug.state region,
         ug.state state,
         sy.school_year school_year,
         COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN f.student_user_id ELSE NULL END),0) pct_female,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN f.student_user_id ELSE NULL END),0) pct_urm,
         COUNT(DISTINCT CASE WHEN up.basic_proficiency_at IS NOT NULL THEN f.student_user_id ELSE NULL END) students_proficient,
         COUNT(DISTINCT CASE WHEN se.script_id IN (select script_id from csf_script_ids)
                                   THEN f.student_user_id ELSE NULL END) students_csf, 
         COUNT(DISTINCT CASE WHEN (se.script_id IN (select distinct script_id from analysis.course_structure where course_name_long = 'CS Discoveries')) or
                                   (se.course_id in (select distinct course_id from analysis.course_structure where course_name_long = 'CS Discoveries')) 
                                   THEN f.student_user_id ELSE NULL END) students_csd,          
         COUNT(DISTINCT CASE WHEN (se.script_id IN (select distinct script_id from analysis.course_structure where course_name_long = 'CS Principles')) or
                                   (se.course_id in (select distinct course_id from analysis.course_structure where course_name_long = 'CS Principles')) 
                                   THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN sc.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro') THEN f.student_user_id ELSE NULL END) students_hoc
  FROM dashboard_production_pii.users u
    JOIN dashboard_production_pii.user_geos ug 
      ON ug.user_id = u.id
    JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    JOIN dashboard_production.user_scripts us 
      ON us.user_id = f.student_user_id and us.started_at is not null
    JOIN dashboard_production.scripts sc 
      ON sc.id = se.script_id
    JOIN dashboard_production_pii.users u_students 
      ON u_students.id = us.user_id
    LEFT JOIN dashboard_production.user_proficiencies up 
      ON up.user_id = u_students.id
    LEFT JOIN analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
  WHERE country = 'United States'
  AND   u_students.current_sign_in_at IS NOT NULL
  AND   u_students.user_type = 'student'
  AND   ug.state IS NOT NULL
  GROUP BY 1,2,3,4
  UNION ALL
  SELECT 'City' region_type,
         ug.city|| ', ' ||ug.state region,
         ug.state state,
        sy.school_year school_year,       
        COUNT(DISTINCT u.id) teachers,
         COUNT(DISTINCT f.student_user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN f.student_user_id ELSE NULL END),0) pct_female,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN f.student_user_id ELSE NULL END)::FLOAT/ NULLIF(COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN f.student_user_id ELSE NULL END),0) pct_urm,
         COUNT(DISTINCT CASE WHEN up.basic_proficiency_at IS NOT NULL THEN f.student_user_id ELSE NULL END) students_proficient,
         COUNT(DISTINCT CASE WHEN se.script_id IN (select script_id from csf_script_ids)
                                   THEN f.student_user_id ELSE NULL END) students_csf, 
         COUNT(DISTINCT CASE WHEN (se.script_id IN (select distinct script_id from analysis.course_structure where course_name_long = 'CS Discoveries')) or
                                   (se.course_id in (select distinct course_id from analysis.course_structure where course_name_long = 'CS Discoveries')) 
                                   THEN f.student_user_id ELSE NULL END) students_csd,          
         COUNT(DISTINCT CASE WHEN (se.script_id IN (select distinct script_id from analysis.course_structure where course_name_long = 'CS Principles')) or
                                   (se.course_id in (select distinct course_id from analysis.course_structure where course_name_long = 'CS Principles')) 
                                   THEN f.student_user_id ELSE NULL END) students_csp,
         COUNT(DISTINCT CASE WHEN sc.name IN ('starwars','starwarsblocks','mc','minecraft','hourofcode','flappy','artist','frozen','infinity','playlab','gumball','iceage','sports','basketball','hero','applab-intro') THEN f.student_user_id ELSE NULL END) students_hoc
  FROM dashboard_production_pii.users u
    JOIN dashboard_production_pii.user_geos ug 
      ON ug.user_id = u.id
    JOIN dashboard_production.sections se 
      ON se.user_id = u.id
    JOIN dashboard_production.followers f 
      ON f.section_id = se.id
    JOIN dashboard_production.user_scripts us 
      ON us.user_id = f.student_user_id and us.started_at is not null
    JOIN dashboard_production.scripts sc 
      ON sc.id = se.script_id
    JOIN dashboard_production_pii.users u_students 
      ON u_students.id = us.user_id
    LEFT JOIN dashboard_production.user_proficiencies up 
      ON up.user_id = u_students.id
    LEFT JOIN analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
  WHERE country = 'United States'
  AND   u_students.current_sign_in_at IS NOT NULL
  AND   u_students.user_type = 'student'
  AND   ug.city IS NOT NULL
  AND   ug.state IS NOT NULL
  GROUP BY 1,2,3,4
  
WITH NO SCHEMA BINDING;

GRANT SELECT ON outreach_stats_by_year_view TO reader_pii;
GRANT SELECT ON outreach_stats_by_year_view TO reader;
GRANT TRIGGER, UPDATE, SELECT, INSERT, RULE, DELETE, REFERENCES ON outreach_stats_by_year_view TO mary;
GRANT REFERENCES, TRIGGER, UPDATE, SELECT, INSERT, RULE, DELETE ON outreach_stats_by_year_view TO admin;

