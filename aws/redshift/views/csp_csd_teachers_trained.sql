create or replace view analysis.csp_csd_teachers_trained as
with 
-- school information collated through manual feedback/editing after teachercons 2017.
schools_pd_2017 as
(
  select 
    studio_person_id, 
    school_id
  from analysis_pii.teachers_trained_2017 tt
    join dashboard_production_pii.users u on u.id = tt.user_id
),
-- school information collated by ben and emilia by looking up teacher information on google,
-- in account information, or in various PLC spreadsheets
schools_pd_2016 as 
(
  select studio_person_id, id::varchar as school_id
  from public.bb_nces_matches_cleaned
),
-- school information in the users table
-- takes the school information for the account most recently used if conflicting for a single studio person
schools_users as
(
  select
  	studio_person_id,
  	school_id
  from
  (
    select 
    	u.studio_person_id,
    	si.school_id,
    	row_number() over(partition by u.studio_person_id order by usi.last_confirmation_date desc) row_num
    from dashboard_production_pii.user_school_infos usi
    join dashboard_production_pii.users u on u.id = usi.user_id
    join dashboard_production.school_infos si on si.id = usi.school_info_id
    join analysis.school_stats ss on ss.school_id = si.school_id
    where (ss.stage_hi = 1 or ss.stage_mi = 1 or ss.stage_hi is null)
  )
  where row_num = 1
),
-- combines information from above three source into a single piece of school information for a studio_person_id
schools as
(
  select 
    sp.id as studio_person_id, 
    coalesce(su.school_id, schools_pd_2016.school_id, schools_pd_2017.school_id) school_id
  from dashboard_production_pii.studio_people sp
    left join schools_users su on su.studio_person_id = sp.id 
    left join schools_pd_2016 on schools_pd_2016.studio_person_id = sp.id
    left join schools_pd_2017 on schools_pd_2017.studio_person_id = sp.id
),
-- all teachers trained in 2016 or prior
trained_2016 as
(
  select 
    tp.studio_person_id,
    'CS Principles' as course,
    '2016-17' as school_year,
    rp1617.regional_partner_id
  from dashboard_production_pii.teacher_profiles tp
    left join public.bb_regional_partner_matches_cleaned rpm on rpm.studio_person_id = tp.studio_person_id
    left join public.bb_regional_partner_name_id_mappings_1617 rp1617 on rp1617.regional_partner_name = rpm.partner
  where tp.studio_person_id not in
  (
    select 
      studio_person_id
    from dashboard_production_pii.teacher_profiles
    where (other_pd = 'nmsi' and pd is null)
  )
),
-- all teachers trained in 2017
trained_2017 as
(
  select 
    studio_person_id,
    course,
    '2017-18' as school_year,
    regional_partner_id
  from analysis_pii.teachers_trained_2017 tt
    join dashboard_production_pii.users u on u.id = tt.user_id
    left join public.bb_regional_partner_name_id_mappings_1718 rp1718 on rp1718.regional_partner_name = tt.regional_partner
),
-- all teachers trained in 2018
trained_2018 as
(
  select 
    studio_person_id,
    course,
    '2018-19' as school_year,
    tt.regional_partner_id
  from analysis_pii.teachers_trained_2018 tt
),
-- all teachers trained in 2019
trained_2019 as
(
  select 
    studio_person_id,
    course,
    '2019-20' as school_year,
    tt.regional_partner_id,
    max(case when source = 'scholarship' then 1 else 0 end) as scholarship
  from analysis_pii.teachers_trained_2019 tt
  group by 1,2,3,4
)
select 
  t.*,
  0 as scholarship,
  sc.school_id
from trained_2016 t
  join schools sc on sc.studio_person_id = t.studio_person_id

union all

select 
  t.*, 
  0 as scholarship,
  sc.school_id
from trained_2017 t
  join schools sc on sc.studio_person_id = t.studio_person_id

union all

select 
  t.*, 
  0 as scholarship,
  sc.school_id
from trained_2018 t
  join schools sc on sc.studio_person_id = t.studio_person_id
  
union all

select 
  t.*,
  sc.school_id
from trained_2019 t
  join schools sc on sc.studio_person_id = t.studio_person_id

with no schema binding;

grant select on analysis.csp_csd_teachers_trained to group reader, group reader_pii, group admin;
