DROP VIEW IF EXISTS quarterly_workshop_attendance_view CASCADE;

CREATE OR REPLACE VIEW analysis.quarterly_workshop_attendance_view AS
SELECT u.studio_person_id,
       pdw.course,
       sy.school_year,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Units 1 and 2',
          '2-day Academic Year, Units 1 to 3',
          'Workshop 1: Unit 3',
          '2-day, Workshops 1+2: Units 3-4 and Explore Task',
          '2-day, Workshops 1+2: Units 3 and 4'
        ) 
        and pda.id is not null THEN 1 ELSE 0 END) q1,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Unit 3',
          '2-day Academic Year, Units 1 to 3',
          'Workshop 2: Unit 4',
          'Workshop 2: Unit 4 and Explore Task',
          '2-day, Workshops 1+2: Units 3-4 and Explore Task',
          '2-day, Workshops 1+2: Units 3 and 4'
        ) 
        and pda.id is not null THEN 1 ELSE 0 END) q2,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Units 4 and 5',
          '1-day Academic Year, Unit 4 + Explore Prep', 
          '2-day Academic Year, Units 4 and 5 + AP Prep',
          '2-day Academic Year, Units 4 to 6',
          'Workshop 3: Unit 5 and Create Task',
          'Workshop 3: Unit 5',
          '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam',
          '2-day, Workshops 3+4: Units 5 and 6'
        ) 
        and pda.id is not null THEN 1 ELSE 0 END) q3,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Unit 6',
          '1-day Academic Year, Unit 5 + Create Prep',
          '2-day Academic Year, Units 4 and 5 + AP Prep',
          '2-day Academic Year, Units 4 to 6',
          'Workshop 4: Unit 5 and Multiple Choice Exam',
          'Workshop 4: Unit 6',
          '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam',
          '2-day, Workshops 3+4: Units 5 and 6'
        ) 
        and pda.id is not null THEN 1 ELSE 0 END) q4,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Units 1 and 2',
          '2-day Academic Year, Units 1 to 3',
          'Workshop 1: Unit 3',
          '2-day, Workshops 1+2: Units 3-4 and Explore Task',
          '2-day, Workshops 1+2: Units 3 and 4'
        ) 
        THEN 1 ELSE 0 END) q1_enrolled,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Unit 3',
          '2-day Academic Year, Units 1 to 3',
          'Workshop 2: Unit 4',
          'Workshop 2: Unit 4 and Explore Task',
          '2-day, Workshops 1+2: Units 3-4 and Explore Task',
          '2-day, Workshops 1+2: Units 3 and 4'
        ) 
        THEN 1 ELSE 0 END) q2_enrolled,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Units 4 and 5',
          '1-day Academic Year, Unit 4 + Explore Prep', 
          '2-day Academic Year, Units 4 and 5 + AP Prep',
          '2-day Academic Year, Units 4 to 6',
          'Workshop 3: Unit 5 and Create Task',
          'Workshop 3: Unit 5',
          '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam',
          '2-day, Workshops 3+4: Units 5 and 6'
        ) 
        THEN 1 ELSE 0 END) q3_enrolled,
       MAX(CASE WHEN pdw.subject IN 
        (
          '1-day Academic Year, Unit 6',
          '1-day Academic Year, Unit 5 + Create Prep',
          '2-day Academic Year, Units 4 and 5 + AP Prep',
          '2-day Academic Year, Units 4 to 6',
          'Workshop 4: Unit 5 and Multiple Choice Exam',
          'Workshop 4: Unit 6',
          '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam',
          '2-day, Workshops 3+4: Units 5 and 6'
        ) 
        THEN 1 ELSE 0 END) q4_enrolled
FROM dashboard_production_pii.pd_workshops pdw
  JOIN dashboard_production_pii.pd_sessions pds 
    ON pds.pd_workshop_id = pdw.id
  JOIN dashboard_production_pii.pd_enrollments pde 
    ON pde.pd_workshop_id = pdw.id
  LEFT JOIN dashboard_production_pii.pd_attendances pda 
    ON pda.pd_enrollment_id = pde.id
  JOIN dashboard_production_pii.users u 
    ON u.id = pde.user_id
  JOIN analysis.school_years sy on pds.start between sy.started_at and sy.ended_at
WHERE pdw.course IN ('CS Principles','CS Discoveries')
AND   pds.start >= '2017-08-01'
AND   pdw.deleted_at IS NULL
AND   pdw.subject IN (
-- CSP
'1-day Academic Year, Units 1 and 2',
'1-day Academic Year, Unit 3',
'1-day Academic Year, Unit 4 + Explore Prep',
'1-day Academic Year, Unit 5 + Create Prep',
'2-day Academic Year, Units 1 to 3',
'2-day Academic Year, Units 4 and 5 + AP Prep',
  -- 2019-2020
'Workshop 1: Unit 3',
'Workshop 2: Unit 4 and Explore Task',
'Workshop 3: Unit 5 and Create Task',
'Workshop 4: Unit 5 and Multiple Choice Exam',
'2-day, Workshops 1+2: Units 3-4 and Explore Task',
'2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam',
-- CSD
'1-day Academic Year, Units 1 and 2',
'1-day Academic Year, Unit 3',
'1-day Academic Year, Units 4 and 5',
'1-day Academic Year, Unit 6',
'2-day Academic Year, Units 1 to 3',
'2-day Academic Year, Units 4 to 6',
  -- 2019-2020
'Workshop 1: Unit 3',
'Workshop 2: Unit 4',
'Workshop 3: Unit 5',
'Workshop 4: Unit 6',
'2-day, Workshops 1+2: Units 3 and 4',
'2-day, Workshops 3+4: Units 5 and 6')
GROUP BY 1,2,3
WITH NO SCHEMA BINDING;
