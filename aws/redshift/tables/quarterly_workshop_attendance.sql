drop table if exists analysis.quarterly_workshop_attendance;
CREATE TABLE analysis.quarterly_workshop_attendance AS
  SELECT u.studio_person_id,
         pdw.course,
         MAX(CASE WHEN pdw.subject IN ('Units 1 and 2: The Internet and Digital Information','Units 2 and 3: Web Development and Animations') THEN 1 ELSE 0 END) q1,
         MAX(CASE WHEN pdw.subject IN ('Units 2 and 3: Processing data, Algorithms, and Programming','Units 3 and 4: Building Games and User Centered Design') THEN 1 ELSE 0 END) q2,
         MAX(CASE WHEN pdw.subject IN ('Units 4 and 5: Big Data, Privacy, and Building Apps','Units 4 and 5: App Prototyping and Data & Society') THEN 1 ELSE 0 END) q3,
         MAX(CASE WHEN pdw.subject IN ('Units 5 and 6: Building Apps and AP Assessment Prep','Unit 6: Physical Computing') THEN 1 ELSE 0 END) q4
  FROM dashboard_production_pii.pd_workshops pdw
    JOIN dashboard_production_pii.pd_sessions pds 
      ON pds.pd_workshop_id = pdw.id
    JOIN dashboard_production_pii.pd_enrollments pde 
      ON pde.pd_workshop_id = pdw.id
    JOIN dashboard_production_pii.pd_attendances pda 
      ON pda.pd_enrollment_id = pde.id
    JOIN dashboard_production_pii.users u 
      ON u.id = pde.user_id
  WHERE pdw.course IN ('CS Principles','CS Discoveries')
  AND   pds.start >= '2017-08-01'
  AND   pdw.deleted_at IS NULL
  AND   pdw.subject IN (
  -- CSP
  'Units 1 and 2: The Internet and Digital Information',
  'Units 2 and 3: Processing data, Algorithms, and Programming',
  'Units 4 and 5: Big Data, Privacy, and Building Apps',
  'Units 5 and 6: Building Apps and AP Assessment Prep',
  -- CSD
  'Units 2 and 3: Web Development and Animations',
  'Units 3 and 4: Building Games and User Centered Design',
  'Units 4 and 5: App Prototyping and Data & Society',
  'Unit 6: Physical Computing')
  GROUP BY 1,2;

GRANT ALL PRIVILEGES ON analysis.quarterly_workshop_attendance TO GROUP admin;
GRANT SELECT ON analysis.quarterly_workshop_attendance TO GROUP reader, GROUP reader_pii;
