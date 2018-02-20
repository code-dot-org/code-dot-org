create or replace view analysis.csf_started as
select us.script_id, sc.name script_name, us.user_id, started_at
from user_scripts us
join scripts sc on sc.id = us.script_id
join users u on u.id = us.user_id and u.user_type = 'student'
where sc.name in 
(
'20-hour','course1','course2','course3','course4',
'coursea','courseb','coursec','coursed','coursee','coursef','express','pre-express'
)
and us.started_at is not null;
