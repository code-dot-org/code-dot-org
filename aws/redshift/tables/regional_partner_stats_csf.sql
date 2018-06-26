--CHANGES
-- addition of school years beyond 2017 --  includes teaching data from the same year they were trained and any subsequent years 
-- removed 'location'

-- ISSUES
-- right now this analysis depends primarily on the teachers_trained views, which contain one entry per person, with the corresponding 'first year trained' as the school_year
      -- this means that if teachers are trained in multiple years then only info from their first year of training will get joined
      -- to Mary, this does not seem ideal 
      
-- CHANGED DEPENDENCIES
-- before using this code to update analysis.regional_partner_stats, certain other tables need to be updated, and their references updated here
-- analysis.csf_teachers_trained and analysis.csp_csd_teachers_trained need to be updated using the code in the file 'teahers_trained_updates.sql'
-- then, references in this file to public.csf_teachers_trained_test and public.csp_csd_teachers_trained_test should be replaced with 'analysis.csf_teachers_trained' and 'analysis.csp_csd_teachers_trained'
-- these are views and so do not need to be added to Github
-- similarly, the tables analysis.teacher_most_progress and analysis.student_activity need to be updated and then their references in this file replaced with the originals
-- these two need to be updated on Github

-- NOTES ON HOW TO UPDATE 
-- after updating at the dependencies listed above and noted with 'PUBLIC' in the code....
-- replace all instances of 'public.regional_partner_stats_csf_pivoted' with 'analysis.regional_partner_stats_csf' and re-run table creation
-- this table will be generated daily from code hosted on github, so need to talk to Ben about how to update that process


drop table if exists analysis.regional_partner_stats_csf;
create table analysis.regional_partner_stats_csf AS

with 
csf_teachers_trained_temp as 
(
  select 
  user_id,
  u.studio_person_id,
  'CS Fundamentals'::varchar as course,
  min(school_year) as school_year,
  max(regional_partner) as regional_partner,
  max(regional_partner_id) as regional_partner_id, 
  min(trained_at) as trained_at
  from
  (
    SELECT  
        ctt.user_id, 
        ctt.trained_at,
        regional_partner_id::int, 
        rp.name::varchar as regional_partner
        FROM 
        analysis.csf_teachers_trained ctt
        LEFT JOIN dashboard_production_pii.pd_enrollments pde
          ON pde.user_id = ctt.user_id
         LEFT JOIN dashboard_production_pii.pd_attendances pda 
           ON pda.pd_enrollment_id = pde.id
         LEFT JOIN dashboard_production_pii.pd_workshops pdw 
           ON pdw.id = pde.pd_workshop_id
         LEFT JOIN dashboard_production_pii.pd_sessions pds 
           ON pds.pd_workshop_id = pdw.id
        LEFT JOIN dashboard_production_pii.regional_partners rp  
           ON pdw.regional_partner_id = rp.id     
           where course = 'CS Fundamentals'
  ) csf_train
  JOIN analysis.training_school_years sy on csf_train.trained_at between sy.started_at and sy.ended_at
  JOIN dashboard_production.users u on u.id = csf_train.user_id
  group by 1, 2
),
completed as
(
  select 
    user_id,
    'CS Fundamentals' as course,
    school_year,
    script_name
  from analysis.csf_completed_teachers
),
started as 
(
select 
    user_id,
    'CS Fundamentals' as course,
    school_year,
    script_name
  from analysis.csf_started_teachers 
),
pd_enrollments_with_year as
( 
  select pd_workshop_id, first_name, last_name, email, user_id, school_year
    from dashboard_production_pii.pd_enrollments pde
    join dashboard_production_pii.pd_workshops pw
    on pde.pd_workshop_id = pw.id
    join analysis.training_school_years sy 
    on pw.started_at between sy.started_at and sy.ended_at
    and pw.deleted_at is null and pde.deleted_at is null
),
pd_facilitators as
( select pdw.id as workshop_id,
 listagg(u2.name, ', ') as facilitator_names
  FROM dashboard_production_pii.pd_workshops pdw
  JOIN dashboard_production_pii.pd_workshops_facilitators pwf
        ON pwf.pd_workshop_id = pdw.id
  JOIN dashboard_production_pii.users u2
        ON  pwf.user_id = u2.id
  group by 1

)

  SELECT distinct 
         -- row_number() OVER(ORDER BY d.user_id ASC)  as row_num,
         d.user_id,
         d.studio_person_id,
         FIRST_VALUE(pde.first_name) OVER (PARTITION BY d.user_id  ORDER BY (CASE WHEN  pde.first_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as first_name,
         FIRST_VALUE(pde.last_name) OVER (PARTITION BY d.user_id ORDER BY (CASE WHEN  pde.last_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as last_name,
         FIRST_VALUE(pde.email) OVER (PARTITION BY d.user_id ORDER BY (CASE WHEN  pde.email IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as email,
         d.course,
         d.school_year as school_year_trained,
         s.school_year as school_year_taught,
         s.script_name,
         rp.name as regional_partner_name,
         rp.id as regional_partner_id,
         ss_user.school_name school_name,
         ss_user.school_id school_id,
         ss_user.city city,
         ss_user.state state,
         ss_user.school_district_name school_district_name,
         ss_user.school_district_id school_district_id,
         ss_user.high_needs high_needs_school,
         ss_user.rural rural_school, 
         csfa.workshop_id,
         csfa.subject,
         csfa.trained_by_regional_partner,
         csfa.started_at as workshop_date, 
         csfa.workshop_id::varchar(16) || ', '::varchar(2) || extract(month from csfa.started_at)::varchar(16) || '/'::varchar(2) || extract(day from csfa.started_at)::varchar(16) || '/'::varchar(2) || extract(year from csfa.started_at)::varchar(16) as workshop_id_year,
         -- concat(csfa.workshop_id::varchar(16), ', '::varchar(2), extract(month from csfa.started_at)::varchar(16), '/'::varchar(2), extract(day from csfa.started_at)::varchar(16), '/'::varchar(2), extract(year from csfa.started_at)::varchar(16)) as workshop_id_year,
         pwf.facilitator_names,
         -- started and completed
         case when s.user_id is not null then 1 else 0 end as started,
         case when c.user_id is not null then 1 else 0 end as completed,
         -- sections and students   
        --  sat.total_sections as total_sections_all_courses,
        --  sat.total_students as total_students_all_courses,
         sa.sections_of_course,
         sa.students_in_course,
         -- stage number and stage name reached by the majority of students, and number of students who reached the stage in each STARTED course
          tmp.stage_name_most_progress,
          tmp.stage_number_most_progress, 
          tmp.students_stage_most_progress,
          -- student gender
          sa.students_female as students_female_in_course,
          sa.students_gender as students_gender_in_course
  FROM csf_teachers_trained_temp d 
-- school info
  LEFT JOIN dashboard_production_pii.users u  -- users needed to get school_info_id
         ON d.user_id = u.id
  LEFT JOIN dashboard_production.school_infos si_user
         ON si_user.id = u.school_info_id
  LEFT JOIN analysis.school_stats ss_user
         ON ss_user.school_id = si_user.school_id
-- attendance
  LEFT JOIN analysis.csf_workshop_attendance csfa -- functions mostly to get the regional partner's location info and to decide whether the person was 'trained_by_partner'
        ON csfa.user_id = d.user_id
        AND csfa.course = d.course
        AND csfa.school_year = d.school_year
--pii tables (regional partner names, person names, emails, locations)
  LEFT JOIN pd_facilitators pwf
      ON pwf.workshop_id = csfa.workshop_id
  LEFT JOIN dashboard_production_pii.regional_partners rp  
       ON csfa.regional_partner_id = rp.id 
  LEFT JOIN pd_enrollments_with_year pde   -- only join pde if they are are trained by regional partner 
        ON pde.user_id = d.user_id
        AND pde.school_year = d.school_year 
-- analysis tables 
  LEFT JOIN started s
       ON s.user_id = d.user_id
      AND s.school_year >= d.school_year 
  LEFT JOIN completed c
         ON c.user_id = d.user_id
         AND c.script_name = s.script_name
         AND c.school_year  = s.school_year
  LEFT JOIN analysis.teacher_most_progress_csf tmp
         ON tmp.user_id = d.user_id
         and tmp.script_name = s.script_name
         and tmp.school_year = s.school_year
  LEFT JOIN analysis.student_activity_csf sa 
         ON sa.user_id = d.user_id
         AND sa.school_year = s.school_year
         AND sa.script_name = s.script_name            
;

GRANT ALL PRIVILEGES ON analysis.regional_partner_stats_csf TO GROUP admin;
GRANT SELECT ON analysis.regional_partner_stats_csf TO GROUP reader_pii;
