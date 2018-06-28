drop table if exists analysis.teacher_most_progress_csf;
CREATE table analysis.teacher_most_progress_csf AS
SELECT user_id,
       script_name,
       school_year,
       stage_name stage_name_most_progress,
       stage_number stage_number_most_progress,
       students AS students_stage_most_progress
FROM (
-- Rank which stage has most students in it by teacher and script
     SELECT user_id,
            script_name,
            stage_name,
            stage_number,
            school_year,
            students,
            ROW_NUMBER() OVER (PARTITION BY user_id, school_year, script_name ORDER BY students DESC) student_rank 
     FROM (
     -- Select # of students in each stage for each script by teacher
       SELECT user_id,
              script_name,
              stage_name,
              stage_number,
              school_year,
              COUNT(*) students 
       FROM (
         -- Rank stages (in courses a - f + express and pre-express) by most recently updated for each student
         SELECT se.user_id as user_id,
                script_name,
                stage_name,
                us.stage_number,
                school_year,
                ROW_NUMBER() OVER (PARTITION BY us.user_id, school_year, script_name ORDER BY us.updated_at DESC) update_rank 
         FROM dashboard_production.sections se 
                JOIN dashboard_production.followers f 
                  ON f.section_id = se.id 
                JOIN analysis.user_stages us 
                  ON us.user_id = f.student_user_id 
                 AND us.script_id IN (1,17,18,19,23,236, 259, 239, 237, 241, 258, 238, 240)
                JOIN dashboard_production_pii.users u_students
                  ON u_students.id = us.user_id AND u_students.user_type = 'student'
                JOIN analysis.course_structure cs 
                  ON cs.stage_id = us.stage_id
                JOIN dashboard_production_pii.users u on u.id = se.user_id -- teachers
                JOIN school_years sy on  us.started_at between sy.started_at and sy.ended_at
       ) 
       WHERE update_rank = 1 
       GROUP BY 1,2,3,4,5
     )
   ) 
   WHERE student_rank = 1;


GRANT ALL PRIVILEGES ON analysis.teacher_most_progress_csf TO GROUP admin;
GRANT SELECT ON analysis.teacher_most_progress_csf TO GROUP reader, GROUP reader_pii;
