drop table if exists analysis.student_activity_csf;

CREATE table analysis.student_activity_csf AS
with csf_script_ids as
(select sc.id 
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

  SELECT cst.user_id user_id,
         cst.school_year,
         cst.script_name,
         COUNT(DISTINCT se.id) sections_of_course,
         COUNT(DISTINCT us.user_id) students_in_course,
         COUNT(DISTINCT CASE WHEN u_students.gender = 'f' THEN us.user_id ELSE NULL END) students_female,
         COUNT(DISTINCT CASE WHEN u_students.gender IN ('m','f','n') THEN us.user_id ELSE NULL END) students_gender
  FROM 
  analysis.csf_started_teachers cst
    JOIN  dashboard_production.sections se -- no filter on section creation date, section course assignment
     ON cst.user_id = se.user_id
    JOIN dashboard_production.followers fo 
      ON fo.section_id = se.id
    JOIN dashboard_production.user_scripts us
      ON us.user_id = fo.student_user_id 
    JOIN csf_script_ids csi
      ON csi.id = us.script_id
    --JOIN analysis.course_structure cs 
      --ON cs.script_id = us.script_id    
    JOIN dashboard_production_pii.users u_students
      ON u_students.id = us.user_id AND u_students.user_type = 'student'
    JOIN school_years sy on  us.started_at between sy.started_at and sy.ended_at
  GROUP BY 1, 2, 3;

GRANT ALL PRIVILEGES ON analysis.student_activity_csf TO GROUP admin;
GRANT SELECT ON analysis.student_activity_csf TO GROUP reader, GROUP reader_pii;

select count(distinct user_id) from student_activity_csf; --898829
-- 349898

select top 10 * from sections;
