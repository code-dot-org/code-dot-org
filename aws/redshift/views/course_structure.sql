DROP table analysis.course_structure;
create table analysis.course_structure as
(select 
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
  case when lockable = 1 then st.absolute_position else st.relative_position end stage_number, 
  case when sl.script_id = '26' and lsl.level_id = '14633' then '1' else lsl.level_id end as level_id, --------------------- hard coded error correction, level_script_levels defines the first level of this script as id# 14,633 when user_levels defines this level as #1
  le.name level_name, 
  sl.position as level_number,
  --case when json_extract_path_text(sl.properties, 'challenge') = 'true' then 1 else 0 end as challenge,
  case when sl.assessment = 1 then 1 else 0 end as assessment,
  --case when json_extract_path_text(le.properties, 'mini_rubric') = 'true' then 1 else 0 end as mini_rubric
  case when json_extract_path_text(sc.properties, 'curriculum_umbrella') = '' then 'other'
  else lower(json_extract_path_text(sc.properties, 'curriculum_umbrella')) end as course_name_true,
  rank () over (partition by sl.script_id order by stage_number, sl.position) level_script_order,
  le.updated_at as updated_at
from dashboard_production.levels_script_levels lsl
  join dashboard_production.script_levels sl on sl.id = lsl.script_level_id
  join dashboard_production.stages st on st.id = sl.stage_id
  join dashboard_production.levels le on le.id = lsl.level_id
  join dashboard_production.scripts sc on sc.id = sl.script_id
  left join dashboard_production.course_scripts cs on cs.script_id = sc.id
  left join dashboard_production.unit_groups c on c.id = cs.course_id
  left join analysis.course_names cn on cn.versioned_course_id = c.id
  left join analysis.script_names sn on sn.versioned_script_id = sc.id
  );


GRANT ALL PRIVILEGES ON analysis.course_structure TO GROUP admin;
GRANT SELECT ON analysis.course_structure TO GROUP reader, GROUP reader_pii;
