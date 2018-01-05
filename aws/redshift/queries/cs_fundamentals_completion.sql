-- get list of unplugged script-stages 
-- (script_id, stage)
create temp table #unplugged_stages as 
select distinct sl.script_id, st.absolute_position stage
from dashboard_production.levels_script_levels lsl
join dashboard_production.script_levels sl on sl.id = lsl.script_level_id
join dashboard_production.stages st on st.id = sl.stage_id
join dashboard_production.levels le on le.id = lsl.level_id
-- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
where sl.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and type = 'Unplugged';

create temp table #standalone_video_stages as 
select script_id, absolute_position
from
(
select sl.script_id, st.absolute_position, count(distinct le.id) levels, count(distinct case when type = 'StandaloneVideo' then le.id else null end) levels_standalone_video
from dashboard_production.levels_script_levels lsl
join dashboard_production.script_levels sl on sl.id = lsl.script_level_id
join dashboard_production.stages st on st.id = sl.stage_id
join dashboard_production.levels le on le.id = lsl.level_id
-- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
where sl.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
group by 1,2
)
where levels = 1 and levels_standalone_video = 1
;

create temp table #unplugged_and_standalone_video_stages as
select *
from #unplugged_stages
union all
select *
from #standalone_video_stages;

-- get script-stage counts that are plugged 
-- (script_id, stages)
create temp table #plugged_stage_counts as
select script_id, 
case 
when script_id = 1 then 9 -- manual fix for 20-hour, where unplugged levels are type "Blockly"
when script_id = 240 then 8 -- manual fix for course e, which has optional pre-stages and end of course capstone 
when script_id = 241 then 10 -- manual fix for course f, which has optional pre-stages and end of course capstone
when script_id = 258 then 19 -- manual fix for express, which has end of course project
else stages end as stages 
from
(
select st.script_id, count(distinct st.absolute_position::int) stages
from dashboard_production.stages st
left join #unplugged_and_standalone_video_stages us on us.script_id = st.script_id and us.stage = st.absolute_position
where us.stage is null
-- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
and st.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
group by 1
); 

-- get user-script-stage-start_date combinations 
-- (user_id, script_id, stage_id, stage_created_at)
drop table if exists #stage_starts;
create temp table #stage_starts as
select ul.user_id, ul.script_id, sl.stage_id, min(ul.created_at) stage_created_at
from user_levels ul
join dashboard_production.levels l on l.id = ul.level_id
join dashboard_production.levels_script_levels lsl on lsl.level_id = ul.level_id
join dashboard_production.script_levels sl on sl.id = lsl.script_level_id and ul.script_id = sl.script_id
join dashboard_production.stages st on st.id = sl.stage_id
join dashboard_production.scripts sc on sc.id = ul.script_id
join dashboard_production.users u on u.id = ul.user_id
left join #unplugged_and_standalone_video_stages us on us.stage = st.absolute_position and us.script_id = ul.script_id
where us.stage is null -- filter out unplugged stages
-- CSF scripts: Old courses 1-4 (17,18,19,23), new courses A-F (236-241), 20-hour course (1), express (258) and pre-express (259)
and ul.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and u.user_type = 'student'
group by 1,2,3;

-- get list of last day of each month
-- (end_of_month)
drop table if exists #end_of_month;
create temp table #end_of_month as
select (
    last_day(dateadd('month', -1 * row_number() over (order by true), getdate()::date))
  )::date as end_of_month
from users limit 48;

-- get user-script-month-# of stages in script-# of stages started to that point in time
-- (user_id, script_id, end_of_month, script_stages, progress_stages)
drop table if exists #monthly_stage_progress;
create temp table #monthly_stage_progress as
select ss.user_id, ss.script_id, eom.end_of_month, psc.stages script_stages, count(stage_id) progress_stages
from #stage_starts ss
join #end_of_month eom on stage_created_at <= end_of_month
join #plugged_stage_counts psc on psc.script_id = ss.script_id
group by 1,2,3,4;

-- get user-script-month where user completed script
-- (user_id, script_id, first_month_complete)
drop table if exists public.bb_csf_monthly_script_completion;
create table public.bb_csf_monthly_script_completion as
select user_id, script_id, min(end_of_month) first_month_complete
from public.bb_csf_monthly_stage_progress msp
where progress_stages >= script_stages
group by 1,2;

-- add teacher_user_id to student completion data for teacher counts, and count students completing by month
-- will duplicate any student that is in multiple sections
-- (teacher_user_id, end_of_month, students_completed)
drop table if exists #teacher_students_progress;
create temp table #teacher_students_progress as
select teacher_user_id, eom.end_of_month, count(distinct case when first_month_complete <= eom.end_of_month then student_user_id else null end) students_completed
from
(
select se.user_id teacher_user_id, msc.first_month_complete, student_user_id
from #test2 msc
join followers f on f.student_user_id = msc.user_id
join sections se on se.id = f.section_id
)
join #end_of_month eom on 1=1
group by 1,2;

drop table if exists public.bb_csf_monthly_teacher_completion;
create table public.bb_csf_monthly_teacher_completion as
select teacher_user_id, min(end_of_month) first_month_complete
from #teacher_students_progress
where students_completed >= 5
group by 1;

-- # of teachers completing CSF for first time
-- (first_month_complete, teachers)
select 'Teacher with classroom completing CSF for first time' metric, count(*) value
from public.bb_csf_monthly_teacher_completion
where   DATE_PART(month,first_month_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_month_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- get count by month of students completing their first script
-- (first_script_complete, students)
select 'Students completing CSF for first time' metric, count(*) value
from
(
select user_id, min(first_month_complete) first_script_complete
from public.bb_csf_monthly_script_completion
group by 1
)
where   DATE_PART(month,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- pct female
select 'Students completing CSF for the first time, % female' metric, count(distinct case when u.gender = 'f' then u.id else null end)::float / count(distinct case when u.gender in ('m','f') then u.id else null end) value
from
(
select user_id, min(first_month_complete) first_script_complete
from public.bb_csf_monthly_script_completion
group by 1
) temp
join users u on u.id = temp.user_id
where   DATE_PART(month,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- *******************************************************
-- *** SAME METRICS -- ONLY FOR PD'D STUDENTS/TEACHERS ***
-- *******************************************************

-- # of PD'd teachers completing CSF for first time
-- (first_month_complete, teachers)
select 'PDd teacher with classroom completing CSF for first time' metric, count(*) value
from public.bb_csf_monthly_teacher_completion
where   DATE_PART(month,first_month_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_month_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
and teacher_user_id in
(
select distinct f.student_user_id user_id
from followers f
join sections se on se.id = f.section_id
where se.section_type = 'csf_workshop'
union
select distinct pde.user_id
from pd_enrollments pde
join pd_attendances pda on pda.pd_enrollment_id = pde.id
join pd_workshops pdw on pdw.id = pde.pd_workshop_id 
where course = 'CS Fundamentals'
)
group by 1

union all

-- get count by month of students with PD'd teachers completing their first script
-- (first_script_complete, students)
select 'Students of PDd teachers completing first script' metric, count(*) value
from
(
select msc.user_id, min(first_month_complete) first_script_complete
from public.bb_csf_monthly_script_completion msc
join followers f on f.student_user_id = msc.user_id
join sections se on se.id = f.section_id
where se.user_id in 
(
select distinct f.student_user_id user_id
from followers f
join sections se on se.id = f.section_id
where se.section_type = 'csf_workshop'
union
select distinct pde.user_id
from pd_enrollments pde
join pd_attendances pda on pda.pd_enrollment_id = pde.id
join pd_workshops pdw on pdw.id = pde.pd_workshop_id 
where course = 'CS Fundamentals'
)
group by 1
)
where   DATE_PART(month,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1

union all

-- pct female
select 'Students of PDd teachers completing first CSF script, % female' metric, count(distinct case when u.gender = 'f' then u.id else null end)::float / count(distinct case when u.gender in ('m','f') then u.id else null end) value
from
(
select msc.user_id, min(first_month_complete) first_script_complete
from public.bb_csf_monthly_script_completion msc
join followers f on f.student_user_id = msc.user_id
join sections se on se.id = f.section_id
where se.user_id in 
(
select distinct f.student_user_id user_id
from followers f
join sections se on se.id = f.section_id
where se.section_type = 'csf_workshop'
union
select distinct pde.user_id
from pd_enrollments pde
join pd_attendances pda on pda.pd_enrollment_id = pde.id
join pd_workshops pdw on pdw.id = pde.pd_workshop_id 
where course = 'CS Fundamentals'
)
group by 1
) temp
join users u on u.id = temp.user_id
where   DATE_PART(month,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN 12 ELSE DATE_PART(month,getdate()) - 1 END
AND   DATE_PART(year,first_script_complete) = CASE WHEN DATE_PART(month,getdate()) = 1 THEN DATE_PART(year,getdate()) - 1 ELSE DATE_PART(year,getdate()) END
group by 1;
