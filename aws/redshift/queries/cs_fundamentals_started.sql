-- Note: reran several of these for June (first individual month since backpopulating), and noticed slightly different counts for previous months.
-- Queries are conditional on tables that can change.

-- New CSF teachers by month
select count(distinct user_id) value, 'New CSF teachers' metric
from
(
select user_id, min(created_at) date_first_section
from
(
select se.user_id, se.id section_id, se.created_at, count(distinct f.student_user_id) students
from dashboard_production.sections se
join dashboard_production.followers f on f.section_id = se.id
join dashboard_production.user_scripts us on us.user_id = f.student_user_id
where se.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
group by 1,2,3
)
where students >= 5
group by 1
)
where date_part(month, date_first_section) = 8
and date_part(year, date_first_section) = 2017

union all

-- New CSF students by month
select count(distinct user_id) value, 'New CSF students' metric 
from
(
select user_id, min(started_at) date_first_activity
from
(
select us.user_id, us.started_at
from dashboard_production.user_scripts us
where us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
)
group by 1
)
where date_part(month, date_first_activity) = 8
and date_part(year, date_first_activity) = 2017

union all

-- New CSF students by month, percent female
select COUNT(distinct case when gender = 'f' then user_id end)::float / COUNT(distinct user_id) value,
'New CSF students, % female' metric
from
(
select user_id, gender, min(started_at) date_first_activity
from
(
select us.user_id, us.started_at, u.gender
from dashboard_production.user_scripts us
join dashboard_production_pii.users u on u.id = us.user_id
where us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and gender in ('m', 'f')
)
group by 1,2
)
where date_part(month, date_first_activity) = 8
and date_part(year, date_first_activity) = 2017

union all

-- new teachers who started teaching who went through PD
-- note: no check on when they started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
select date_part(month, date_first_section) as month, date_part(year, date_first_section) as year, count(distinct user_id) teachers
from
(
select user_id, min(created_at) date_first_section
from
(
select se.user_id, se.id section_id, se.created_at, count(distinct f.student_user_id) students
from dashboard_production.sections se
join dashboard_production.followers f on f.section_id = se.id
join dashboard_production.user_scripts us on us.user_id = f.student_user_id
where se.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and se.user_id in 
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
group by 1,2,3
)
where students >= 5
group by 1
)
--where date_part(month, date_first_section) = 8
--and date_part(year, date_first_section) = 2017
group by 1,2;

-- New CSF students by month who are in classrooms with a trained teacher.
-- note: no check on when their teachers started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
select date_part(month, date_first_activity) as month, date_part(year, date_first_activity) as year, count(distinct user_id) students
from
(
select user_id, min(started_at) date_first_activity
from
(
select us.user_id, us.started_at
from dashboard_production.sections se
join dashboard_production.followers f on f.section_id = se.id
join dashboard_production.user_scripts us on us.user_id = f.student_user_id
where se.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and se.user_id in 
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
)
group by 1
)
--where date_part(month, date_first_activity) = 8
--and date_part(year, date_first_activity) = 2017
group by 1,2;


-- pct_female, new CSF students by month who are in classrooms with a trained teacher.
-- note: no check on when their teachers started teaching vs. when they went through PD.
-- Could have started teaching before going through PD
select date_part(month, date_first_activity) as month, date_part(year, date_first_activity) as year, 
COUNT(distinct case when gender = 'f' then user_id end)::float / COUNT(distinct user_id) pct_female
from
(
select user_id, gender, min(started_at) date_first_activity
from
(
select us.user_id, us.started_at, u.gender
from dashboard_production.sections se
join dashboard_production.followers f on f.section_id = se.id
join dashboard_production.user_scripts us on us.user_id = f.student_user_id
join dashboard_production_pii.users u on u.id = us.user_id
where se.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and us.script_id in (1,17,18,19,23,236,237,238,239,240,241,258,259)
and u.gender in ('m','f')
and se.user_id in 
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
)
group by 1,2
)
--where date_part(month, date_first_activity) = 8
--and date_part(year, date_first_activity) = 2017
group by 1,2;

-- % high needs among students in CSF classrooms with PD'd teachers
-- Only about 10K students (out of ~100K per month) who are starting with PD teachers we actually have data on their FARM status?
SELECT DATE_PART(month,date_first_activity) AS month,
       DATE_PART(year,date_first_activity) AS year,
       count(*),
       AVG(high_needs::FLOAT) pct_high_needs
FROM (SELECT us.user_id,
                   high_needs,
                   min(us.started_at) date_first_activity
            FROM dashboard_production.sections se
              JOIN dashboard_production.followers f ON f.section_id = se.id
              JOIN dashboard_production.user_scripts us ON us.user_id = f.student_user_id
              join dashboard_production.users u on u.id = us.user_id
              JOIN dashboard_production_pii.pd_enrollments pde ON pde.user_id = se.user_id
              JOIN dashboard_production.school_infos si ON si.id = pde.school_info_id
              join school_stats ss on ss.school_id = si.school_id
            WHERE se.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            AND   us.script_id IN (1,17,18,19,23,236,237,238,239,240,241,258,259)
            and u.user_type = 'student'
            and se.user_id in 
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
            GROUP BY 1,2)
--where date_part(month, date_first_activity) = 8
--and date_part(year, date_first_activity) = 2017
GROUP BY 1,
         2;
