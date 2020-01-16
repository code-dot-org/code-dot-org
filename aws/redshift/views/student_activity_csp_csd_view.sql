CREATE OR REPLACE view analysis.student_activity_csp_csd_view  AS

WITH distinct_csp_csd_script_ids as
(SELECT DISTINCT script_id, course_name_short, course_name_long from analysis.course_structure where course_name_short in ('csd', 'csp'))

  SELECT u_teachers.studio_person_id,
         sy.school_year,
         course_name_long,
         course_name_short,
         COUNT(DISTINCT se.id) sections,
         COUNT(DISTINCT us.user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN us.user_id ELSE NULL END) students_female,
         COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f', 'n') THEN us.user_id ELSE NULL END) students_gender,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN us.user_id ELSE NULL END) students_urm,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%black%' THEN us.user_id ELSE NULL END) students_black,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hispanic%' THEN us.user_id ELSE NULL END) students_hispanic,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%american_indian%' THEN us.user_id ELSE NULL END) students_native,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hawaiian%' THEN us.user_id ELSE NULL END) students_hawaiian,
         COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN us.user_id ELSE NULL END) students_race,
         COUNT(DISTINCT ccs.user_id) as students_started,
         COUNT(DISTINCT ccc.user_id) as students_completed
  FROM dashboard_production.sections se -- no filter on section creation date, section course assignment
    JOIN dashboard_production.followers fo 
      ON fo.section_id = se.id
    JOIN dashboard_production.user_scripts us
      ON us.user_id = fo.student_user_id 
    JOIN distinct_csp_csd_script_ids dsi
      ON dsi.script_id = us.script_id
    JOIN dashboard_production_pii.users u_students
      ON u_students.id = us.user_id AND u_students.user_type = 'student'
    JOIN dashboard_production_pii.users u_teachers
      ON u_teachers.id = se.user_id
   JOIN analysis.school_years sy 
      ON  us.started_at between sy.started_at and sy.ended_at
      AND fo.created_at between sy.started_at and sy.ended_at
   LEFT JOIN analysis.csp_csd_started ccs
      ON ccs.user_id = u_students.id 
      AND ccs.started_at between sy.started_at and sy.ended_at
   LEFT JOIN analysis.csp_csd_completed ccc
      ON ccc.user_id = u_students.id 
      AND ccc.completed_at between sy.started_at and sy.ended_at
      
  GROUP BY 1, 2, 3, 4
  
WITH NO SCHEMA BINDING;

