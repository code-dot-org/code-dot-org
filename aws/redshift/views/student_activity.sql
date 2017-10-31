CREATE OR REPLACE VIEW analysis.student_activity AS
  SELECT se.user_id,
         COUNT(DISTINCT se.id) sections,
         COUNT(DISTINCT us.user_id) students,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN us.user_id ELSE NULL END) students_female,
         COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f') THEN us.user_id ELSE NULL END) students_gender,
         COUNT(DISTINCT CASE WHEN u_students.urm = 1 THEN us.user_id ELSE NULL END) students_urm,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%black%' THEN us.user_id ELSE NULL END) students_black,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hispanic%' THEN us.user_id ELSE NULL END) students_hispanic,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%american_indian%' THEN us.user_id ELSE NULL END) students_native,
         COUNT(DISTINCT CASE WHEN u_students.races LIKE '%hawaiian%' THEN us.user_id ELSE NULL END) students_hawaiian,
         COUNT(DISTINCT CASE WHEN u_students.urm IN (0,1) THEN us.user_id ELSE NULL END) students_race
  FROM dashboard_production.sections se
    JOIN dashboard_production.followers fo 
      ON fo.section_id = se.id
    JOIN dashboard_production.user_scripts us
      ON us.user_id = fo.student_user_id AND us.script_id IN (181,187,169,189,223,221,122,123,124,125,126,127) AND us.started_at >= '2017-07-01'
    JOIN dashboard_production_pii.users u_students
      ON u_students.id = us.user_id AND u_students.user_type = 'student'
  WHERE se.created_at >= '2017-06-01'
  GROUP BY 1 
WITH NO SCHEMA BINDING;

GRANT ALL PRIVILEGES ON analysis.student_activity TO GROUP admin;
GRANT SELECT ON analysis.student_activity TO GROUP reader, GROUP reader_pii;
