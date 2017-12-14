-- New CSF teachers by month
SELECT COUNT(DISTINCT user_id_teacher) value,
       'New CSF teachers' metric
FROM (SELECT user_id_teacher,
             user_id_student,
             first_script_started_at,
             ROW_NUMBER() OVER (PARTITION BY user_id_teacher ORDER BY first_script_started_at ASC) student_progress_rank
      FROM (SELECT se.user_id user_id_teacher,
                   us.user_id user_id_student,
                   MIN(us.started_at) first_script_started_at
            FROM dashboard_production.sections se
              JOIN dashboard_production.followers f ON f.section_id = se.id
              JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259) 
            AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.started_at IS NOT NULL
            GROUP BY 1,
                     2))
WHERE student_progress_rank = 5
AND   DATE_PART(month,first_script_started_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_started_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2

UNION ALL

-- New CSF students by month
SELECT COUNT(DISTINCT user_id) value,
       'New CSF students' metric
FROM (SELECT user_id,
             MIN(started_at) date_first_activity
      FROM (SELECT us.user_id,
                   us.started_at
            FROM dashboard_production.user_scripts us
              JOIN dashboard_production.users u ON u.id = us.user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   u.user_type = 'student')
      GROUP BY 1)
WHERE DATE_PART(month,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2

UNION ALL

-- New CSF students by month, percent female
SELECT COUNT(DISTINCT CASE WHEN gender = 'f' THEN user_id END)::FLOAT/ COUNT(DISTINCT user_id) value,
       'New CSF students, % female' metric
FROM (SELECT user_id,
             gender,
             MIN(started_at) date_first_activity
      FROM (SELECT us.user_id,
                   us.started_at,
                   u.gender
            FROM dashboard_production.user_scripts us
              JOIN dashboard_production_pii.users u ON u.id = us.user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   gender IN ('m','f')
            AND   user_type = 'student')
      GROUP BY 1,
               2)
WHERE DATE_PART(month,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2

UNION ALL

-- new teachers who started teaching who went through PD
-- note: no check on when they started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
SELECT COUNT(DISTINCT user_id_teacher) value,
       'New PDd CSF teachers' metric
FROM (SELECT user_id_teacher,
             user_id_student,
             first_script_started_at,
             ROW_NUMBER() OVER (PARTITION BY user_id_teacher ORDER BY first_script_started_at ASC) student_progress_rank
      FROM (SELECT se.user_id user_id_teacher,
                   us.user_id user_id_student,
                   MIN(us.started_at) first_script_started_at
            FROM dashboard_production.sections se
              JOIN dashboard_production.followers f ON f.section_id = se.id
              JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.started_at IS NOT NULL
            GROUP BY 1,
                     2))
WHERE student_progress_rank = 5
AND   DATE_PART(month,first_script_started_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_started_at) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
AND   user_id_teacher IN (SELECT DISTINCT f.student_user_id user_id
                          FROM followers f
                            JOIN sections se ON se.id = f.section_id
                          WHERE se.section_type = 'csf_workshop'
                          UNION
                          SELECT DISTINCT pde.user_id
                          FROM pd_enrollments pde
                            JOIN pd_attendances pda ON pda.pd_enrollment_id = pde.id
                            JOIN pd_workshops pdw ON pdw.id = pde.pd_workshop_id
                          WHERE course = 'CS Fundamentals')
GROUP BY 2

UNION ALL

-- New CSF students by month who are in classrooms with a trained teacher.
-- note: no check on when their teachers started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
SELECT COUNT(DISTINCT user_id) value,
       'New PDd CSF students' metric
FROM (SELECT user_id,
             MIN(started_at) date_first_activity
      FROM (SELECT us.user_id,
                   us.started_at
            FROM dashboard_production.sections se
              JOIN dashboard_production.followers f ON f.section_id = se.id
              JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   se.user_id IN (SELECT DISTINCT f.student_user_id user_id
                                 FROM followers f
                                   JOIN sections se ON se.id = f.section_id
                                 WHERE se.section_type = 'csf_workshop'
                                 UNION
                                 SELECT DISTINCT pde.user_id
                                 FROM pd_enrollments pde
                                   JOIN pd_attendances pda ON pda.pd_enrollment_id = pde.id
                                   JOIN pd_workshops pdw ON pdw.id = pde.pd_workshop_id
                                 WHERE course = 'CS Fundamentals'))
      GROUP BY 1)
WHERE DATE_PART(month,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2

UNION ALL

-- pct_female, new CSF students by month who are in classrooms with a trained teacher.
-- note: no check on when their teachers started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
SELECT COUNT(DISTINCT CASE WHEN gender = 'f' THEN user_id END)::FLOAT/ COUNT(DISTINCT user_id) value,
       'New CSF students, % female' metric
FROM (SELECT user_id,
             gender,
             MIN(started_at) date_first_activity
      FROM (SELECT us.user_id,
                   us.started_at,
                   u.gender
            FROM dashboard_production.sections se
              JOIN dashboard_production.followers f ON f.section_id = se.id
              JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
              JOIN dashboard_production_pii.users u ON u.id = us.user_id
            -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
            WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   u.gender IN ('m','f')
            AND   se.user_id IN (SELECT DISTINCT f.student_user_id user_id
                                 FROM followers f
                                   JOIN sections se ON se.id = f.section_id
                                 WHERE se.section_type = 'csf_workshop'
                                 UNION
                                 SELECT DISTINCT pde.user_id
                                 FROM pd_enrollments pde
                                   JOIN pd_attendances pda ON pda.pd_enrollment_id = pde.id
                                   JOIN pd_workshops pdw ON pdw.id = pde.pd_workshop_id
                                 WHERE course = 'CS Fundamentals'))
      GROUP BY 1,
               2)
WHERE DATE_PART(month,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2

UNION ALL

-- % high needs among students in CSF classrooms with PD'd teachers
-- Only about 10K students (out of ~100K per month) who are starting with PD teachers we actually have data on their FARM status?
SELECT AVG(high_needs::FLOAT) value,
       '% high needs among PDd CSF students' metric
FROM (SELECT us.user_id,
             high_needs,
             MIN(us.started_at) date_first_activity
      FROM dashboard_production.sections se
        JOIN dashboard_production.followers f ON f.section_id = se.id
        JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
        JOIN dashboard_production.users u ON u.id = us.user_id
        JOIN dashboard_production_pii.pd_enrollments pde ON pde.user_id = se.user_id
        JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
        JOIN school_stats ss ON ss.school_id = si.school_id
      -- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
      WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
      AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
      AND   u.user_type = 'student'
      AND   se.user_id IN (SELECT DISTINCT f.student_user_id user_id
                           FROM followers f
                             JOIN sections se ON se.id = f.section_id
                           WHERE se.section_type = 'csf_workshop'
                           UNION
                           SELECT DISTINCT pde.user_id
                           FROM pd_enrollments pde
                             JOIN pd_attendances pda ON pda.pd_enrollment_id = pde.id
                             JOIN pd_workshops pdw ON pdw.id = pde.pd_workshop_id
                           WHERE course = 'CS Fundamentals')
      GROUP BY 1,
               2)
WHERE DATE_PART(month,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,date_first_activity) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
GROUP BY 2;

