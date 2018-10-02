drop table if exists analysis.student_activity_csp_csd;
CREATE table analysis.student_activity_csp_csd AS
  SELECT u_teachers.studio_person_id,
         school_year,
         COUNT(DISTINCT se.id) sections,
         COUNT(DISTINCT us.user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN us.user_id ELSE NULL END) students_female,
         COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f', 'n') THEN us.user_id ELSE NULL END) students_gender,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN us.user_id ELSE NULL END) students_urm,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%black%' THEN us.user_id ELSE NULL END) students_black,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hispanic%' THEN us.user_id ELSE NULL END) students_hispanic,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%american_indian%' THEN us.user_id ELSE NULL END) students_native,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hawaiian%' THEN us.user_id ELSE NULL END) students_hawaiian,
         COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN us.user_id ELSE NULL END) students_race
  FROM dashboard_production.sections se -- no filter on section creation date, section course assignment
    JOIN dashboard_production.followers fo 
      ON fo.section_id = se.id
    JOIN dashboard_production.user_scripts us
      ON us.user_id = fo.student_user_id 
      AND us.script_id IN (select distinct script_id from analysis.course_structure where course_name_short in ('csd', 'csp'))-- student progress included whether CSP or CSD 
    JOIN dashboard_production_pii.users u_students
      ON u_students.id = us.user_id AND u_students.user_type = 'student'
    JOIN dashboard_production_pii.users u_teachers
      ON u_teachers.id = se.user_id
   JOIN analysis.school_years sy on  us.started_at between sy.started_at and sy.ended_at
  GROUP BY 1, 2;

GRANT ALL PRIVILEGES ON analysis.student_activity_csp_csd TO GROUP admin;
GRANT SELECT ON analysis.student_activity_csp_csd TO GROUP reader, GROUP reader_pii;
