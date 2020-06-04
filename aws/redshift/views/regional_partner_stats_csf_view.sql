DROP VIEW IF EXISTS analysis_pii.regional_partner_stats_csf_view CASCADE;

create view analysis_pii.regional_partner_stats_csf_view 
AS
with 
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
implementation_365 as
(
select 
    tt.user_id,
    tt.trained_at,
    date_part(month, trained_at) month_trained,
    date_part(dayofweek, trained_at) day_of_week_trained, 
    min(datediff(day, tt.trained_at, st.started_at)) as days_to_start,
    min(datediff(day, tt.trained_at, ct.completed_at)) as days_to_complete,
    CASE WHEN days_to_start < 0 then 1 else 0 end as started_before_training,
    CASE WHEN days_to_complete < 0 then 1 else 0 end as completed_before_training,
    CASE WHEN days_to_start <= 365  and started_before_training = 0 then 1 else 0 end as started_365,
    CASE WHEN days_to_complete <= 365 and completed_before_training = 0 then 1 else 0 end as completed_365,
    CASE WHEN days_to_start <= 365  then 1 else 0 end as started_365_or_before,
    CASE WHEN days_to_complete <= 365  then 1 else 0 end as completed_365_or_before
  from analysis.csf_teachers_trained tt
    left join analysis.csf_started_teachers st on st.user_id = tt.user_id  
    left join analysis.csf_completed_teachers ct on ct.user_id = tt.user_id  
  group by 1, 2, 3
),

repeat_trainings as
(
  select
    user_id,
    min(trained_at) as first_training
  from 
    analysis.csf_teachers_trained
  group by 1
),

pd_enrollments_with_year as
( 
  select 
    pd_workshop_id, 
    first_name, 
    last_name, 
    email, 
    user_id, 
    school_year,
    json_extract_path_text(pde.properties, 'role') as role
  from dashboard_production_pii.pd_enrollments pde
    join dashboard_production_pii.pd_workshops pw
        on pde.pd_workshop_id = pw.id
    join analysis.training_school_years sy 
        on pw.started_at between sy.started_at and sy.ended_at
        and pw.deleted_at is null and pde.deleted_at is null
),
pd_facilitators as
( 
select   
    pdw.id as workshop_id,
    listagg(u2.name, ', ') as facilitator_names
  FROM dashboard_production_pii.pd_workshops pdw
    JOIN dashboard_production_pii.pd_workshops_facilitators pwf
          ON pwf.pd_workshop_id = pdw.id
    JOIN dashboard_production_pii.users u2
          ON  pwf.user_id = u2.id
  group by 1
)
  SELECT distinct 
         d.user_id,
         u.studio_person_id,
         FIRST_VALUE(pde.first_name) OVER (PARTITION BY d.user_id  ORDER BY (CASE WHEN  pde.first_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as first_name,
         FIRST_VALUE(pde.last_name) OVER (PARTITION BY d.user_id ORDER BY (CASE WHEN  pde.last_name IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as last_name,
         FIRST_VALUE(pde.email) OVER (PARTITION BY d.user_id ORDER BY (CASE WHEN  pde.email IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as email,
         FIRST_VALUE(pde.role) OVER (PARTITION BY d.user_id ORDER BY (CASE WHEN  pde.email IS NULL THEN 1 ELSE 2 END), pde.pd_workshop_id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as role,
         'CS Fundamentals'::varchar as course,
         sy.school_year as school_year_trained,
         month_trained,
         day_of_week_trained, 
         days_to_start,
         days_to_complete,
         started_before_training,
         completed_before_training,
         started_365,
         completed_365,
         started_365_or_before,
         completed_365_or_before,
         sa.school_year as school_year_taught,
         s.script_name,
         CASE WHEN rp.name is null THEN 'No Partner' ELSE rp.name END as regional_partner_name,        
         rp.id as regional_partner_id,
         ss_user.school_name school_name,
         ss_user.school_id school_id,
         ss_user.city city,
         ss_user.state state,
         ss_user.zip zip,
         ss_user.school_district_name school_district_name,
         ss_user.school_district_id school_district_id,
         ss_user.high_needs high_needs_school,
         ss_user.rural rural_school, 
         csfa.workshop_id,
         CASE WHEN csfa.subject is null THEN 'Intro Workshop' else csfa.subject END as subject,
         CASE WHEN csfa.trained_by_regional_partner is null then 0 else csfa.trained_by_regional_partner END as trained_by_regional_partner,
         CASE WHEN csfa.trained_by_regional_partner_truth is null then 0 else csfa.trained_by_regional_partner_truth END as trained_by_regional_partner_truth, -- temporary while we figure out how to present to RPs
         d.trained_at as trained_at,
         coalesce(csfa.workshop_date, d.trained_at)  as workshop_date, 
         csfa.workshop_date_pdw_ended_at as workshop_date_ended_at,
         CASE WHEN rt.first_training != d.trained_at then 1 else 0 end as repeat_training,
         extract(month from csfa.workshop_date)::varchar(16) || '/'::varchar(2) || extract(day from csfa.workshop_date)::varchar(16) || '/'::varchar(2) || extract(year from csfa.workshop_date)::varchar(16) || ', id:'::varchar(2) || csfa.workshop_id::varchar(16)  as workshop_id_year,
         csfa.month_workshop,
         csfa.day_of_week_workshop,
         CASE WHEN csfa.audience = 'District' then 'Private' else csfa.audience end as audience,
         csfa.funded,
         csfa.funding_type,
         csfa.capacity,
         csfa.zip as zip_workshop,
         csfa.state as state_workshop,
         coalesce(ss_user.state, csfa.state) as state_coalesced,
         csfa.processed_location as processed_location,
         csfa.facilitator_name, 
         csfa.studio_person_id_facilitator,     
         pwf.facilitator_names,
         -- started and completed
         case when s.user_id is not null then 1 else 0 end as started,
         case when c.user_id is not null then 1 else 0 end as completed,
         -- sections and students   
         sa.students_total,         
         sa.sections_of_course,
         sa.students_in_course,
         -- stage number and stage name reached by the majority of students, and number of students who reached the stage in each STARTED course
          tmp.stage_name_most_progress,
          tmp.stage_number_most_progress, 
          tmp.students_stage_most_progress,
          -- student gender
          sa.students_female as students_female_total,
          sa.students_gender as students_gender_total
  FROM analysis.csf_teachers_trained d 
  JOIN analysis.training_school_years sy on d.trained_at between sy.started_at and sy.ended_at
-- school info
  LEFT JOIN dashboard_production_pii.users u  -- users needed to get school_info_id
         ON d.user_id = u.id
  LEFT JOIN dashboard_production.school_infos si_user
         ON si_user.id = u.school_info_id
  LEFT JOIN analysis.school_stats ss_user
         ON ss_user.school_id = si_user.school_id
-- attendance
 -- LEFT JOIN analysis.csf_workshop_attendance csfa -- functions mostly to get the regional partner's location info and to decide whether the person was 'trained_by_partner'
  LEFT JOIN analysis.csf_workshop_attendance csfa   
        ON  csfa.user_id = d.user_id
        AND csfa.workshop_date = d.trained_at 
        AND csfa.future_event = 0 -- removes workshops planned for future dates
        AND csfa.not_attended = 0 -- removes workshops where the person did not attend
  LEFT JOIN repeat_trainings rt
        ON rt.user_id = d.user_id
--pii tables (regional partner names, person names, emails, locations)
  LEFT JOIN pd_facilitators pwf
      ON pwf.workshop_id = csfa.workshop_id
  LEFT JOIN dashboard_production_pii.regional_partners rp  
       ON csfa.regional_partner_id = rp.id 
  LEFT JOIN pd_enrollments_with_year pde   -- only join pde if they are are trained by regional partner 
        ON pde.user_id = d.user_id
        AND pde.school_year = sy.school_year 
-- analysis tables 
  LEFT JOIN analysis.student_activity_csf sa 
         ON sa.user_id = d.user_id
         AND sa.school_year >= sy.school_year 
  LEFT JOIN started s
       ON s.user_id = d.user_id
      AND s.school_year = sa.school_year 
      AND s.script_name = sa.script_name
  LEFT JOIN completed c
         ON c.user_id = d.user_id
         AND c.script_name = s.script_name
         AND c.school_year = s.school_year
  LEFT JOIN implementation_365 i
        ON i.user_id = d.user_id
       AND i.trained_at = d.trained_at
  LEFT JOIN analysis.teacher_most_progress_csf tmp
         ON tmp.user_id = d.user_id
         and tmp.script_name = s.script_name
         and tmp.school_year = sa.school_year
WITH NO SCHEMA BINDING

;

GRANT INSERT, TRIGGER, UPDATE, REFERENCES, RULE, DELETE, SELECT ON analysis_pii.regional_partner_stats_csf_view TO dev;
GRANT SELECT ON analysis_pii.regional_partner_stats_csf_view TO GROUP reader_pii;
GRANT REFERENCES, TRIGGER, UPDATE, SELECT, INSERT, RULE, DELETE ON analysis_pii.regional_partner_stats_csf_view TO GROUP admin;
