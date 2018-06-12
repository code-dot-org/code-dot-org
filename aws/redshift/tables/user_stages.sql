drop table if exists analysis.user_stages;
create table analysis.user_stages as
select 
  ul.user_id, 
  cs.course_id, 
  sl.script_id, 
  st.id stage_id, 
  st.absolute_position stage_number, 
  count(*) levels_attempted,
  min(ul.created_at) as started_at,
  max(ul.updated_at) as updated_at
from dashboard_production.user_levels ul
  join dashboard_production.levels_script_levels lsl on lsl.level_id = ul.level_id
  join dashboard_production.script_levels sl on sl.id = lsl.script_level_id and sl.script_id = ul.script_id
  join dashboard_production.stages st on st.id = sl.stage_id
  join dashboard_production.levels le on le.id = lsl.level_id
  left join dashboard_production.course_scripts cs on cs.script_id = ul.script_id
-- excludes problematic levels shared across the multiple stages in the same script, which we can't differentiate
where le.type != 'StandaloneVideo'
group by 1,2,3,4,5;

GRANT ALL PRIVILEGES ON analysis.user_stages TO GROUP admin;
GRANT SELECT ON analysis.user_stages TO GROUP reader, GROUP reader_pii;
