drop table if exists analysis.teacher_most_progress;
CREATE table analysis.teacher_most_progress AS
SELECT studio_person_id,
       name script_most_progress,
       students AS students_script_most_progress
FROM (
-- Rank which unit has most students in it by teacher
     SELECT studio_person_id,
            name,
            students,
            ROW_NUMBER() OVER (PARTITION BY studio_person_id ORDER BY students DESC) student_rank 
     FROM (
     -- Select # of students in each unit by teacher
       SELECT studio_person_id,
              name,
              COUNT(*) students 
       FROM (
         -- Rank units by most recently updated for each student
         SELECT u.studio_person_id,
                sc.name,
                ROW_NUMBER() OVER (PARTITION BY us.user_id ORDER BY us.updated_at DESC) update_rank 
         FROM dashboard_production.sections se 
                JOIN dashboard_production.followers f 
                  ON f.section_id = se.id 
                JOIN dashboard_production.user_scripts us 
                  ON us.user_id = f.student_user_id AND us.script_id IN (181,187,169,189,223,221,122,123,124,125,126,127) AND us.started_at IS NOT NULL 
                JOIN dashboard_production_pii.users u_students
                  ON u_students.id = us.user_id AND u_students.user_type = 'student'
                JOIN dashboard_production.scripts sc 
                  ON sc.id = us.script_id
                JOIN dashboard_production_pii.users u on u.id = se.user_id
       ) 
       WHERE update_rank = 1 
       GROUP BY 1,2
     )
   ) 
   WHERE student_rank = 1;

GRANT ALL PRIVILEGES ON analysis.teacher_most_progress TO GROUP admin;
GRANT SELECT ON analysis.teacher_most_progress TO GROUP reader, GROUP reader_pii;
