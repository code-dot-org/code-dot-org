DROP VIEW IF EXISTS teacher_most_progress_csp_csd_view CASCADE;

CREATE OR REPLACE view analysis.teacher_most_progress_csp_csd_view AS

WITH distinct_csp_csd_script_ids as
(SELECT DISTINCT script_id, course_name_short, course_name_long from analysis.course_structure where course_name_short in ('csd', 'csp'))

SELECT studio_person_id,
       course_name_short,
       school_year,
       name script_most_progress, 
       students AS students_script_most_progress
FROM (
-- Rank which unit has most students in it by teacher
     SELECT studio_person_id,
            course_name_short,
            school_year,
            name,
            students,
            ROW_NUMBER() OVER (PARTITION BY studio_person_id, course_name_short, school_year ORDER BY students DESC) student_rank 
     FROM (
     -- Select # of students in each unit by teacher
       SELECT studio_person_id,
              course_name_short,
              school_year,
              name,
              COUNT(*) students 
       FROM (
         -- Rank units by most recently updated for each student
         SELECT u.studio_person_id,
                coalesce(script_name_long, sc.name) as name,
                course_name_short,
                school_year,
                ROW_NUMBER() OVER (PARTITION BY us.user_id, course_name_short, school_year ORDER BY us.updated_at DESC) update_rank 
         FROM dashboard_production.sections se 
                JOIN dashboard_production.followers f 
                  ON f.section_id = se.id 
                JOIN dashboard_production.user_scripts us 
                  ON us.user_id = f.student_user_id
                JOIN distinct_csp_csd_script_ids dsi
                  ON dsi.script_id = us.script_id 
                JOIN analysis.script_names sn 
                  ON sn.versioned_script_id = us.script_id                
                JOIN dashboard_production_pii.users u_students
                  ON u_students.id = us.user_id AND u_students.user_type = 'student'
                JOIN dashboard_production.scripts sc 
                  ON sc.id = us.script_id
                JOIN dashboard_production_pii.users u on u.id = se.user_id
                
                JOIN analysis.school_years sy on  us.started_at between sy.started_at and sy.ended_at
       ) 
       WHERE update_rank = 1 
       GROUP BY 1,2,3,4
     )
   ) 
   WHERE student_rank = 1
   
WITH NO SCHEMA BINDING;
