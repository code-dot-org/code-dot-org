-- to figure out
-- 19 teachers who are listed in 2016 and 2017 PD cohort?
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
      studio_person_id, 
      si.school_id, 
      row_number() over(partition by studio_person_id order by current_sign_in_at desc) as how_recent
    from dashboard_production_pii.users u
      join dashboard_production.school_infos si on si.id = u.school_info_id
      join analysis.school_stats ss on ss.school_id = si.school_id
    where si.school_id is not null
      and (ss.stage_mi = 1 or ss.stage_hi = 1 or ss.stage_hi is null)
  )
  where how_recent = 1
),
-- combines information from above three source into a single piece of school information for a studio_person_id
schools as
(
  select 
    sp.id as studio_person_id, 
    coalesce(schools_pd_2016.school_id, schools_pd_2017.school_id, su.school_id) school_id
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
    2016 as year,
    case partner
      when 'Academy for CS Education - Florida International University' then 'Florida International University'
      when 'The Council of Educational Administrative and Supervisory Organizations of Maryland (CEASOM)' then 'Maryland Codes'
      when 'Utah STEM Action Center and Utah Board of Education' then 'Utah STEM Action Center'
      else partner
    end as regional_partner
  from dashboard_production_pii.teacher_profiles tp
    left join public.bb_regional_partner_matches_cleaned rpm on rpm.studio_person_id = tp.studio_person_id
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
    2017 as year,
    case regional_partner
      when 'The Council of Educational Administrative and Supervisory Organizations of Maryland (CEASOM)' then 'Maryland Codes'
      when 'America Campaign - Big Sky Code Academy' then 'Teachers Teaching Tech (MT)'
      when 'No Partner' then NULL
      when 'mindSpark Learning and Colorado Education Initiative' then 'mindSpark Learning'
      else regional_partner
    end as regional_partner
  from analysis_pii.teachers_trained_2017 tt
    join dashboard_production_pii.users u on u.id = tt.user_id
)
select 
  t.*, 
  rp.id regional_partner_id, 
  sc.school_id
from trained_2016 t
  join schools sc on sc.studio_person_id = t.studio_person_id
  left join dashboard_production_pii.regional_partners rp on rp.name = t.regional_partner

union all

select 
  t.*, 
  rp.id regional_partner_id, 
  sc.school_id
from trained_2017 t
  join schools sc on sc.studio_person_id = t.studio_person_id
  left join dashboard_production_pii.regional_partners rp on rp.name = t.regional_partner

with no schema binding;

GRANT ALL PRIVILEGES ON analysis.csp_csd_teachers_trained TO GROUP admin;
GRANT SELECT ON analysis.csp_csd_teachers_trained TO GROUP reader, GROUP reader_pii;
