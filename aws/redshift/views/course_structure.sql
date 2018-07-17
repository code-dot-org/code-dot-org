drop view if exists analysis.course_structure;
create view analysis.course_structure as
select 
  cn.course_name_short,
  cn.course_name_long,
  sn.script_name_short,
  sn.script_name_long,
  c.id course_id, 
  c.name course_name, 
  sl.script_id,
  sn.versioned_script_name, 
  sc.name script_name, 
  st.id stage_id, 
  st.name stage_name, 
  st.absolute_position stage_number, 
  lsl.level_id, 
  le.name level_name, 
  sl.position as level_number
from dashboard_production.levels_script_levels lsl
  join dashboard_production.script_levels sl on sl.id = lsl.script_level_id
  join dashboard_production.stages st on st.id = sl.stage_id
  join dashboard_production.levels le on le.id = lsl.level_id
  join dashboard_production.scripts sc on sc.id = sl.script_id
  left join dashboard_production.course_scripts cs on cs.script_id = sc.id
  left join dashboard_production.courses c on c.id = cs.course_id
  left join analysis.course_names cn on cn.versioned_course_id = c.id
  left join analysis.script_names sn on sn.versioned_script_id = sc.id
order by script_id, stage_number, level_number
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.course_structure TO GROUP admin;
GRANT SELECT ON analysis.course_structure TO GROUP reader, GROUP reader_pii;
