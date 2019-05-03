drop view if exists analysis.contained_level_structure;
create view analysis.contained_level_structure as
select 
cs.course_id, 
cs.course_name, 
cs.script_id,
cs.script_name, 
cs.stage_id,
cs.stage_name,
cs.stage_number, 
cs.level_id as level_group_level_id,
cs.level_name as level_group_level_name,
cl.contained_level_id as level_id,
l2.name as level_name, 
cl.contained_level_page,
cl.contained_level_position,
cl.contained_level_text
from analysis.course_structure cs
join dashboard_production.levels l
  on l.id = cs.level_id 
join dashboard_production.contained_levels cl
  on cl.level_group_level_id = l.id 
join dashboard_production.levels l2
  on cl.contained_level_id = l2.id
where l.type = 'LevelGroup'
;

GRANT ALL PRIVILEGES ON analysis.contained_level_structure TO GROUP admin;
GRANT SELECT ON analysis.contained_level_structure TO GROUP reader, GROUP reader_pii;
