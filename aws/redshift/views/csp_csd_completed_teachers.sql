create or replace view analysis.csp_csd_completed_teachers as
with completed as
(
select 
  user_id,
  school_year, 
  course_name,
  completed_at
from
(
  select 
    se.user_id, 
    com.school_year,
    course_name,
    completed_at::date,
    row_number() over(partition by se.user_id, com.school_year, com.course_name order by completed_at asc) completed_at_order
  from analysis.csp_csd_completed com
    join analysis.school_years sy on com.completed_at between sy.started_at and sy.ended_at
    join dashboard_production.followers f on f.student_user_id = com.user_id and f.created_at between sy.started_at and sy.ended_at
    join dashboard_production.sections se on se.id = f.section_id
)
where completed_at_order = 5
),
half_and_full_csd as
(
-- identifies teachers who are listed as having had completed 
-- the semester-long version of CSD and the year-long version
select 
  user_id,
  school_year,
  count(*)
from completed
where course_name in ('csd','csd_half')
group by 1,2
having count(*) = 2
)
-- removes the semester-long entry for teachers 
-- in the "half_and_full_csd" bucket above
select c.*
from completed c
  left join half_and_full_csd hf on hf.user_id = c.user_id and hf.school_year = c.school_year and c.course_name = 'csd_half'
where hf.user_id is null
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_completed_teachers TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_completed_teachers TO GROUP reader, GROUP reader_pii;
