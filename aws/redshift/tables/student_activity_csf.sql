drop table if exists analysis.student_activity_csf;

CREATE table analysis.student_activity_csf AS
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
   ),
 
student_activity as

  (SELECT   cst.user_id user_id,
           cst.school_year,
           cst.script_name,
           se.id section_id,
           us.user_id student_id,
           u_students.gender gender
  FROM analysis.csf_started_teachers cst
      JOIN  dashboard_production.sections se -- no filter on section creation date, section course assignment
       ON cst.user_id = se.user_id
      JOIN dashboard_production.followers fo 
        ON fo.section_id = se.id
      JOIN dashboard_production.user_scripts us
        ON us.user_id = fo.student_user_id 
      JOIN csf_script_ids csi
        ON csi.script_id = us.script_id
       AND csi.script_name = cst.script_name
      --JOIN analysis.course_structure cs 
        --ON cs.script_id = us.script_id    
      JOIN dashboard_production_pii.users u_students
        ON u_students.id = us.user_id 
       AND u_students.user_type = 'student'
      JOIN analysis.school_years sy 
        on  us.started_at between sy.started_at and sy.ended_at
        AND sy.school_year = cst.school_year),
      
scripts as 
    (SELECT user_id,
             school_year,
             script_name,
             COUNT(DISTINCT section_id) sections_of_course,
             COUNT(DISTINCT student_id) students_in_course
    from student_activity 
    GROUP BY 1, 2, 3), 
  
    no_scripts as (
    SELECT user_id,
             school_year,
             COUNT(DISTINCT student_id) students_total,
             COUNT(DISTINCT CASE WHEN gender = 'f' THEN student_id ELSE NULL END) students_female,
             COUNT(DISTINCT CASE WHEN gender IN ('m','f','n') THEN student_id ELSE NULL END) students_gender
         
    from student_activity 
    GROUP BY 1, 2
    )
select scripts.user_id, scripts.school_year, script_name, students_total, students_female, students_gender, sections_of_course, students_in_course
from scripts 
join no_scripts 
on no_scripts.user_id = scripts.user_id 
and no_scripts.school_year = scripts.school_year;

GRANT ALL PRIVILEGES ON analysis.student_activity_csf TO GROUP admin;
GRANT SELECT ON analysis.student_activity_csf TO GROUP reader, GROUP reader_pii;
