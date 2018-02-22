create or replace view csp_completed as
select user_id, started_at::date as completed_at
from
(
  select user_id, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select user_id, script_id, stage_id, started_at, row_number() over(partition by user_id, script_id order by started_at asc) stage_order
    from analysis.user_stages 
    where course_id = 15
  )
  where stage_order = 5
)
where script_order = 4
with no schema binding;
