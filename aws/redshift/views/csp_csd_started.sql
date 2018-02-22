create or replace view analysis.csp_csd_started as
select course_id, course_name, user_id, min(started_at) started_at
from analysis.course_structure cs
join dashboard_production.user_scripts us on us.script_id = cs.script_id
join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
where cs.course_name in ('csd','csp')
and started_at is not null
group by 1,2,3
with no schema binding;
