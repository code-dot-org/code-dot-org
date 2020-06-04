--Extracts # of total students and # of URM students for each response.
--Why use each of these nested functions?  
--COALESCE( -- If blank, replace with 0. Needed for adding together fields.  
--NULLIF( -- If blank string, replace with null. Causes problems if you try to convert a blank string to int.  
--REGEXP_REPLACE( -- Remove all characters from response that are non-integers (e.g., %, letters, etc.)  
--JSON_EXTRACT_PATH_TEXT( -- Identify JSON field of interest

drop table if exists #survey_results;
create temp table #survey_results as
SELECT user_id,
white + black + hispanic + asian + native + american_indian + other students_survey,
black + hispanic + native + american_indian + other urm_survey,
farm as farm_survey
FROM
(
SELECT user_id, properties,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_hispanic'),'[^0-9]'),'')::INT,0) hispanic,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_white'),'[^0-9]'),'')::INT,0) white,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_black'),'[^0-9]'),'')::INT,0) black,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_asian'),'[^0-9]'),'')::INT,0) asian,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_native'),'[^0-9]'),'')::INT,0) native,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_american_indian'),'[^0-9]'),'')::INT,0) american_indian,
COALESCE(NULLIF(REGEXP_REPLACE(JSON_EXTRACT_PATH_TEXT(properties,'diversity_other'),'[^0-9]'),'')::INT,0) other,
NULLIF(JSON_EXTRACT_PATH_TEXT(properties,'diversity_farm'), '')::INT as farm
FROM dashboard_production.survey_results
WHERE kind = 'Diversity2019'
AND properties != '{}') as temp;

-- See what percentage of each teacher's students are under 13
drop table if exists #class_composition;
create temp table #class_composition as
SELECT sr.user_id,
count(distinct f.student_user_id) students_cs,
count(distinct case when u.birthday >= '2006-05-01' then f.student_user_id end) students_under_13_cs,
count(distinct case when u.birthday >= '2006-05-01' then f.student_user_id end) / count(distinct f.student_user_id)::float pct_under_13_cs
FROM dashboard_production.survey_results sr
join dashboard_production.sections se on se.user_id = sr.user_id
join dashboard_production.followers f on f.section_id = se.id and f.created_at >= '2018-07-01' -- new students
join dashboard_production_pii.users u on u.id = f.student_user_id
WHERE kind = 'Diversity2019'
AND sr.properties != '{}'
group by sr.user_id;
 
-- Combine the two above tables.
-- Uncomment if you actually want to replace the table that generated our results.
drop table if exists public.bb_diversity_survey_2019;
create table public.bb_diversity_survey_2019 as
select sr.user_id, students_survey, urm_survey, farm_survey, students_cs, students_under_13_cs, 
pct_under_13_cs
from #survey_results sr
join #class_composition cc on cc.user_id = sr.user_id;

-- Calculate % URM across all classrooms with 5+ students and excluding exactly 100 student classes, as these teachers likely misunderstood the question.
select sum(urm_survey)::float / sum(students_survey) as pct_urm
from public.bb_diversity_survey_2019
where students_survey >= 5 
and students_survey != 100 
and pct_under_13_cs >= 0.5;

-- 7th category here is 70-100% -- maybe should update query to 
-- Calculate % free and reduced lunch across all classrooms with 5+ students and excluding exactly 100 student classes, as these teachers likely misunderstood the question.
select (
-- Free and reduced lunch numerator
select sum(students_survey * case farm_survey when 0 then 0 when 1 then 0.1 when 2 then 0.2 when 3 then 0.3 when 4 then 0.4 when 5 then 0.5 when 6 then 0.6 when 7 then 0.7 else 0 end)
from public.bb_diversity_survey_2019
where students_survey != 100
and students_survey >= 5
) 
/ 
(
-- Free and reduced lunch denominator
select sum(case when farm_survey <= 7 then students_survey else 0 end) 
from public.bb_diversity_survey_2019
where students_survey != 100
and students_survey >= 5
) as pct_free_and_reduced_lunch;

select farm_survey, count(*)
from public.bb_diversity_survey_2019
group by 1

--46% URM in 13+ in 2018-19
select avg(urm::float)
from
(
select distinct u.id, urm
from users u
join sign_ins si on si.user_id = u.id
join user_geos ug on ug.user_id = u.id and ug.country = 'United States' -- added b/c of geolocation bug, may have shown prompt to non-US users
where sign_in_at between '2018-07-01' and '2019-06-30'
and user_type = 'student'
)

--29% over 13
select avg(over_13::float)
from
(
select distinct u.id, case when date_diff('year', birthday, '2019-01-01') >= 13 then 1 else 0 end over_13
from users u
join sign_ins si on si.user_id = u.id
join user_geos ug on ug.user_id = u.id and ug.country = 'United States'
where sign_in_at between '2018-07-01' and '2019-06-30'
and user_type = 'student'
and birthday is not null
)

--50% URM in 2018-19
--I made a copy/paste mistake here originally, using .73 instead of .71 as the proportion of students under 13
--This resulted in writing 51% URM in the board deck, instead of 50%. Was resolved Nov. 11, 2019.
select (.29*.46)+(.71*.51)
