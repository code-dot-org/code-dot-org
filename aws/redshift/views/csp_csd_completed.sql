create or replace view analysis.csp_csd_completed as
with first_semester as
-- date when student finished first semester of CSD
(
select user_id, course_name, school_year, started_at::date as completed_at
from
(
  select user_id, course_name, school_year, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select us.user_id, cn.course_name_short course_name, school_year, sc.name script_name, us.stage_id, us.started_at, row_number() over(partition by us.user_id, sc.name order by us.started_at asc) stage_order
    from analysis.user_stages us
    join dashboard_production.scripts sc on sc.id = us.script_id
    join dashboard_production.course_scripts cs on cs.script_id = us.script_id
    join dashboard_production.courses c on c.id = cs.course_id
    join analysis.course_names cn on cn.versioned_course_id = c.id
    join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
    join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
    where cn.course_name_long = 'CS Discoveries'
      and left(sc.name, 4) in ('csd2','csd3')
  )
  where stage_order = 5 
)
where script_order = 2
),
second_semester_two_unit as
-- date when student finished second semester of CSD, 
-- using 2 unit definition (2 lessons in each of units 4 and 5)
(
select user_id, course_name, school_year, started_at::date as completed_at
from
(
  select user_id, course_name, school_year, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select us.user_id, cn.course_name_short course_name, school_year, sc.name script_name, us.stage_id, us.started_at, row_number() over(partition by us.user_id, sc.name order by us.started_at asc) stage_order
    from analysis.user_stages us
    join dashboard_production.scripts sc on sc.id = us.script_id
    join dashboard_production.course_scripts cs on cs.script_id = us.script_id
    join dashboard_production.courses c on c.id = cs.course_id
    join analysis.course_names cn on cn.versioned_course_id = c.id
    join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
    join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
    where cn.course_name_long = 'CS Discoveries'
      and left(sc.name, 4) in ('csd4','csd5')
  )
  where stage_order = 2
)
where script_order = 2
),
second_semester_one_unit as
-- date when student finished second semester of CSD, 
-- using 1 unit definition (5 lessons in unit 6)
(
select user_id, course_name, school_year, started_at::date as completed_at
from
(
  select user_id, course_name, school_year, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select us.user_id, cn.course_name_short course_name, school_year, sc.name script_name, us.stage_id, us.started_at, row_number() over(partition by us.user_id, sc.name order by us.started_at asc) stage_order
    from analysis.user_stages us
    join dashboard_production.scripts sc on sc.id = us.script_id
    join dashboard_production.course_scripts cs on cs.script_id = us.script_id
    join dashboard_production.courses c on c.id = cs.course_id
    join analysis.course_names cn on cn.versioned_course_id = c.id
    join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
    join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
    where cn.course_name_long = 'CS Discoveries'
      and left(sc.name, 4) = 'csd6'
  )
  where stage_order = 5
)
)
select 
  fs.user_id, 
  case 
    when sst.user_id is not null or sso.user_id is not null then 'csd'
    else 'csd_half'
  end as course_name,
  fs.school_year,
  case
    -- logic first looks for the first second semester completion date (least()), 
    -- then compares to first semester completion date (greatest())
    when sst.user_id is not null or sso.user_id is not null then greatest(fs.completed_at, least(sst.completed_at, sso.completed_at))
    else fs.completed_at
  end as completed_at
from first_semester fs
left join second_semester_two_unit sst on sst.user_id = fs.user_id and sst.school_year = fs.school_year
left join second_semester_one_unit sso on sso.user_id = fs.user_id and sso.school_year = fs.school_year

union all

select user_id, course_name, school_year, started_at::date as completed_at
from
(
  select user_id, course_name, school_year, started_at, row_number() over(partition by user_id order by started_at asc) script_order
  from
  (
    select user_id, cn.course_name_short course_name, school_year, us.script_id, us.stage_id, us.started_at, row_number() over(partition by us.user_id, us.script_id order by us.started_at asc) stage_order
    from analysis.user_stages us
    join dashboard_production.course_scripts cs on cs.script_id = us.script_id
    join dashboard_production.courses c on c.id = cs.course_id
    join analysis.course_names cn on cn.versioned_course_id = c.id
    join analysis.school_years sy on us.started_at between sy.started_at and sy.ended_at
    join dashboard_production.users u on u.id = us.user_id and u.user_type = 'student'
    where cn.course_name_long = 'CS Principles'
  )
  where stage_order = 5
)
where script_order = 4
with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_completed TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_completed TO GROUP reader, GROUP reader_pii;
