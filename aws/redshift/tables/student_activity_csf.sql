drop table if exists analysis.student_activity_csf;
CREATE table analysis.student_activity_csf AS
  SELECT u_teachers.id user_id,
         school_year,
         cs.script_name,
         COUNT(DISTINCT se.id) sections_of_course,
         COUNT(DISTINCT us.user_id) students_in_course,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN us.user_id ELSE NULL END) students_female,
         COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN us.user_id ELSE NULL END) students_gender
  FROM dashboard_production.sections se -- no filter on section creation date, section course assignment
    JOIN dashboard_production.followers fo 
      ON fo.section_id = se.id
    JOIN dashboard_production.user_scripts us
      ON us.user_id = fo.student_user_id 
      AND us.script_id IN (1,17,18,19,23,236, 259, 239, 237, 241, 258, 238, 240)
    JOIN analysis.course_structure cs 
      ON cs.script_id = us.script_id    
    JOIN dashboard_production_pii.users u_students
      ON u_students.id = us.user_id AND u_students.user_type = 'student'
    JOIN dashboard_production_pii.users u_teachers
      ON u_teachers.id = se.user_id -- teachers
    JOIN school_years sy on  us.started_at between sy.started_at and sy.ended_at
  GROUP BY 1, 2, 3;

GRANT ALL PRIVILEGES ON analysis.student_activity_csf TO GROUP admin;
GRANT SELECT ON analysis.student_activity_csf TO GROUP reader, GROUP reader_pii;
