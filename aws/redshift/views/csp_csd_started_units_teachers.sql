-- like csp_csd_started_teachers but for units instead of the entire course
DROP VIEW IF EXISTS analysis.csp_csd_started_units_teachers CASCADE;

create or replace view analysis.csp_csd_started_units_teachers as
select 
  user_id,
  course_name,
  script_name,
  unit_number,
  school_year, 
  max(case when started_at_order = 5 then started_at else null end) as started_at,
  max(case when started_at_order >= 5 then last_progress_at else null end) as last_progress_at
from
(
  select 
    se.user_id,
    course_name, 
    script_name,
    unit_number,
    sy.school_year,
    st.started_at::date as started_at,
    st.last_progress_at::date as last_progress_at,
    row_number() over(partition by course_name, se.user_id, sy.school_year, unit_number order by st.started_at asc) started_at_order
  from public.mb_csp_csd_started_units st
    join analysis.school_years sy 
      on st.started_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f 
      on f.student_user_id = st.user_id 
      and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se 
      on se.id = f.section_id
)
group by 1,2,3,4,5
having max(started_at_order) >= 5
with no schema binding;

GRANT ALL PRIVILEGES ON public.mb_csp_csd_started_units_teachers TO GROUP admin;
GRANT SELECT ON public.mb_csp_csd_started_units_teachers TO GROUP reader, GROUP reader_pii;


-- list of units completed by teachers trained by UNH (where started is defined as 5 students started the unit)
select
distinct 
rp.first_name, rp.last_name, rp.email, su.school_year, su.course_name, su.unit_number
from regional_partner_stats_csp_csd rp
join users u
  on rp.studio_person_id = u.studio_person_id
join mb_csp_csd_started_units_teachers su
  on rp.school_year_taught = su.school_year
  and u.id = su.user_id
where regional_partner_id = 66; -- select * from regional_partners where name like '%UNH%';

-- list of units completed by teachers trained by UNH where started is defined as 5 students started 5+ lessons in the unit 
with students as
(
select 
s.user_id,
s.school_year,
s.course_name,
s.script_name,
s.unit_number,
s.started_at,
s.last_progress_at
from 
(
select
s.user_id,
s.school_year,
s.course_name,
s.script_name,
s.unit_number,
s.started_at,
s.last_progress_at,
row_number() over(partition by us.user_id, unit_number order by us.started_at asc) stage_order
from mb_csp_csd_started_units s
join analysis.school_years sy 
  on s.started_at between sy.started_at and sy.ended_at
join user_stages us
  on s.user_id = us.user_id
 and s.script_id = us.script_id
 and us.started_at between sy.started_at and sy.ended_at
) s
where stage_order = 5), 

teachers as 
(select 
  user_id,
  course_name,
  script_name,
  unit_number,
  school_year, 
  max(case when started_at_order = 5 then started_at else null end) as started_at,
  max(case when started_at_order >= 5 then last_progress_at else null end) as last_progress_at
from
(
  select 
    se.user_id,
    course_name, 
    script_name,
    unit_number,
    sy.school_year,
    st.started_at::date as started_at,
    st.last_progress_at::date as last_progress_at,
    row_number() over(partition by course_name, se.user_id, sy.school_year, unit_number order by st.started_at asc) started_at_order
  from students st
    join analysis.school_years sy 
      on st.started_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f 
      on f.student_user_id = st.user_id 
      and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se 
      on se.id = f.section_id
)
group by 1,2,3,4,5
having max(started_at_order) >= 5

)

select
distinct 
rp.first_name, rp.last_name, rp.email, su.school_year, su.course_name, su.unit_number
from regional_partner_stats_csp_csd rp
join users u
  on rp.studio_person_id = u.studio_person_id
join teachers su
  on rp.school_year_taught = su.school_year
  and u.id = su.user_id
where regional_partner_id = 66; ;


;
