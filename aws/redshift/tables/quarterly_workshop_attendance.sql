drop table if exists analysis.quarterly_workshop_attendance;
CREATE TABLE analysis.quarterly_workshop_attendance AS
  SELECT u.studio_person_id,
         pdw.course,
         sy.school_year,
         -- MAX(pdw.regional_partner_id) as regional_partner_id,
         MAX(CASE WHEN pdw.subject IN ('1-day Academic Year, Units 1 and 2','2-day Academic Year, Units 1 to 3') THEN 1 ELSE 0 END) q1,
         MAX(CASE WHEN pdw.subject IN ('1-day Academic Year, Unit 3', '2-day Academic Year, Units 1 to 3') THEN 1 ELSE 0 END) q2,
         MAX(CASE WHEN pdw.subject IN ('1-day Academic Year, Units 4 and 5','1-day Academic Year, Unit 4 + Explore Prep', 
                                       '2-day Academic Year, Units 4 and 5 + AP Prep', '2-day Academic Year, Units 4 to 6') THEN 1 ELSE 0 END) q3,
         MAX(CASE WHEN pdw.subject IN ('1-day Academic Year, Unit 6','1-day Academic Year, Unit 5 + Create Prep',
                                       '2-day Academic Year, Units 4 and 5 + AP Prep', '2-day Academic Year, Units 4 to 6') THEN 1 ELSE 0 END) q4
  FROM dashboard_production_pii.pd_workshops pdw
    JOIN dashboard_production_pii.pd_sessions pds 
      ON pds.pd_workshop_id = pdw.id
    JOIN dashboard_production_pii.pd_enrollments pde 
      ON pde.pd_workshop_id = pdw.id
    JOIN dashboard_production_pii.pd_attendances pda 
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
  '2-day Academic Year, Units 4 and 5 + AP Prep'
  -- CSD
  '1-day Academic Year, Units 1 and 2',
  '1-day Academic Year, Unit 3',
  '1-day Academic Year, Units 4 and 5',
  '1-day Academic Year, Unit 6',
  '2-day Academic Year, Units 1 to 3',
  '2-day Academic Year, Units 4 to 6')
  GROUP BY 1,2, 3;

GRANT ALL PRIVILEGES ON analysis.quarterly_workshop_attendance TO GROUP admin;
GRANT SELECT ON analysis.quarterly_workshop_attendance TO GROUP reader, GROUP reader_pii;
