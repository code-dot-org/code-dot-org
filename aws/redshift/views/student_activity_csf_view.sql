DROP VIEW IF EXISTS student_activity_csf_view CASCADE;

CREATE OR REPLACE VIEW analysis.student_activity_csf_view AS
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

  (SELECT  cst.user_id user_id,
           cst.school_year,
           cst.script_name,
           se.id section_id,
           us.user_id student_id,
           u_students.gender gender,
           ccs.user_id as student_id_started,
           ccc.user_id as student_id_completed
  FROM analysis.csf_started_teachers cst
      JOIN analysis.school_years sy 
       ON sy.school_year = cst.school_year
      JOIN  dashboard_production.sections se -- no filter on section creation date, section course assignment; date filter comes at user_scripts level
       ON cst.user_id = se.user_id
      JOIN dashboard_production.followers fo 
        ON fo.section_id = se.id
      JOIN dashboard_production.user_scripts us
        ON us.user_id = fo.student_user_id 
        AND  us.started_at between sy.started_at and sy.ended_at
      JOIN analysis.csf_started cs
        ON cs.user_id = us.user_id
        AND cs.started_at between sy.started_at and sy.ended_at
      JOIN csf_script_ids csi
        ON csi.script_id = us.script_id
       AND csi.script_name = cst.script_name
      --JOIN analysis.course_structure cs 
        --ON cs.script_id = us.script_id    
      JOIN dashboard_production_pii.users u_students
        ON u_students.id = us.user_id 
       AND u_students.user_type = 'student'
      LEFT JOIN analysis.csf_started ccs
        ON ccs.user_id = u_students.id 
        AND ccs.started_at between sy.started_at and sy.ended_at
      LEFT JOIN analysis.csf_completed ccc
        ON ccc.user_id = u_students.id 
        AND ccc.completed_at between sy.started_at and sy.ended_at
),
      
scripts as 
    (SELECT user_id,
             school_year,
             script_name,
             COUNT(DISTINCT section_id) sections_of_course,
             COUNT(DISTINCT student_id) students_in_course,
             COUNT(DISTINCT student_id_started) students_started_in_course,
             COUNT(DISTINCT student_id_completed) students_completed_in_course
    from student_activity 
    GROUP BY 1, 2, 3), 
  
no_scripts as (
    SELECT user_id,
             school_year,
             COUNT(DISTINCT student_id) students_total,
             COUNT(DISTINCT student_id_started) students_started_total,
             COUNT(DISTINCT student_id_completed) students_completed_total,
             COUNT(DISTINCT CASE WHEN gender = 'f' THEN student_id ELSE NULL END) students_female,
             COUNT(DISTINCT CASE WHEN gender IN ('m','f','n') THEN student_id ELSE NULL END) students_gender
         
    from student_activity 
    GROUP BY 1, 2
    )
select scripts.user_id, scripts.school_year, script_name, students_total, 
        students_started_total, students_completed_total, students_female, 
        students_gender, sections_of_course, students_in_course, students_completed_in_course
from scripts 
join no_scripts 
on no_scripts.user_id = scripts.user_id 
and no_scripts.school_year = scripts.school_year
WITH NO SCHEMA BINDING;
