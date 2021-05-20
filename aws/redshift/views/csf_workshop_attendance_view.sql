DROP VIEW IF EXISTS csf_workshop_attendance_view CASCADE;

CREATE VIEW analysis.csf_workshop_attendance_view
AS

WITH 

tt_workshop_and_section_ids
AS(
  SELECT DISTINCT 
    workshop_id, 
    section_id 
  FROM analysis.csf_teachers_trained -- replace this with the csf_teachers_trained table after it is updated to include multiple entries
  ),
  
manual -- manually entered states and zips for workshops that did not match previously 
--<<< this needs to be edited to remove section ids that overlap pd_workshop!!!
AS(
    select 
      workshop_id, 
      'manual matching' as processed_location, 
      state_workshop as state,
      zip_workshop as zip, 
      null::int as section_id
    from public.mb_workshop_state_zip_manual
  ),

zip_processed -- extract state and zip from pd_workshops with a properly formatted address
AS(
    -- get state for entries where formatted_address looks like
    -- "formatted_address":"1516 N 35th Ave, Phoenix, AZ 85009, USA"
    -- better than taking first two character capitol letters to avoid "SE 53rd St"
    SELECT id as workshop_id,
           processed_location,
           SUBSTRING(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),2,2) AS state,
           SUBSTRING(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),5,5) AS zip, 
           pdw.section_id
    FROM dashboard_production_pii.pd_workshops pdw
    JOIN tt_workshop_and_section_ids tt 
        ON pdw.id = tt.workshop_id
    WHERE regexp_instr(SPLIT_PART(JSON_EXTRACT_PATH_TEXT(processed_location,'formatted_address'),',',3),'[0-9][0-9][0-9][0-9][0-9]') != 0
    AND   id not in (select workshop_id from manual where workshop_id is not null)
  ),

other_processed -- extract state and zip from pd_workshops with addresses formatted other ways 
AS (
    -- get state for entries where processed_location looks like
    -- {"latitude":47.6062095,"longitude":-122.3320708,"city":"Seattle","state":"Washington","formatted_address":"Seattle, WA, USA"}
    -- or
    -- {"latitude":30.267153,"longitude":-97.7430608,"formatted_address":"Austin, TX, USA"}
    SELECT id as workshop_id,
      processed_location,
      CASE
          WHEN id in (3604, 876, 2976, 1952, 1951, 2881, 2989, 1949) THEN 'FL'
          WHEN id = 2281	THEN 'MS'
          WHEN id = 2920	THEN 'IL'
          WHEN id = 2914	THEN 'IL'
          WHEN id = 2233	THEN 'MO'
          WHEN id = 2356	THEN 'KS'
          WHEN id = 3966	THEN 'LA'
          WHEN id = 2460	THEN 'TX'
          WHEN id = 1928	THEN 'ID'
          WHEN id = 2124	THEN 'AZ'
          WHEN id = 2477	THEN 'CA'
          WHEN id = 2649	THEN 'OR'
          WHEN id = 5132	THEN 'WA'
          WHEN id in (5261, 5262, 5262) THEN 'IA'
          WHEN id = 5060 THEN 'ID'
          WHEN id = 4865 THEN 'WV'
          WHEN json_extract_path_text(processed_location, 'state') != '' THEN json_extract_path_text(processed_location, 'state')
      ELSE regexp_substr(
                json_extract_path_text(processed_location, 'formatted_address')
            , '[A-Z][A-Z]')
      END AS state,
      CASE
          WHEN id in (876, 2976, 1952, 1951, 2881, 2989, 1949) THEN '33172'
          WHEN id = 3604 THEN '32801'
          WHEN id = 2281	THEN '38801'
          WHEN id = 2920	THEN '60134'
          WHEN id = 2914	THEN '62501'
          WHEN id = 2233	THEN '64106'
          WHEN id = 2356	THEN '67801'
          WHEN id = 3966	THEN '71115'
          WHEN id = 2460	THEN '75203'
          WHEN id = 1928	THEN '83333'
          WHEN id = 2124	THEN '85296'
          WHEN id = 2477	THEN '92782'
          WHEN id = 2649	THEN '97366'
          WHEN id = 5132	THEN '98087'
          WHEN id in (5261, 5262, 5262) THEN '52401'
          WHEN id = 5060 THEN '83647'
          WHEN id = 4865 THEN '26506'
      ELSE regexp_substr(
        json_extract_path_text(processed_location, 'formatted_address')
      , '[0-9][0-9][0-9][0-9][0-9]', -15) 
      END AS zip, 
      pdw.section_id
  
    FROM dashboard_production_pii.pd_workshops pdw
    JOIN tt_workshop_and_section_ids tt 
        ON pdw.id = tt.workshop_id
    WHERE course = 'CS Fundamentals'
    AND id NOT IN (SELECT workshop_id FROM zip_processed where workshop_id is not null)
    AND id NOT IN (select workshop_id from manual where workshop_id is not null)
   ),

workshop_state_zip 
AS(

    SELECT *
    FROM manual

    UNION ALL

    SELECT *
    FROM zip_processed

    UNION ALL

    SELECT *
    FROM other_processed
 ),


sections_locations --pulls location data out of pegasus_forms workshops
AS(
    SELECT DISTINCT -- why is this distinct and not others?
         nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int as workshop_id, -- using the section id as the workshop id
         processed_data_text as processed_location,
         json_extract_path_text(processed_data_text, 'location_state_s') as state,  
         json_extract_path_text(processed_data_text, 'location_postal_code_s') as zip,
         null::int as section_id
       FROM pegasus_pii.forms 
       JOIN tt_workshop_and_section_ids tt 
          ON  forms.kind = 'ProfessionalDevelopmentWorkshop'
          AND nullif(json_extract_path_text(data_text, 'section_id_s'),'') =  tt.section_id   
       WHERE zip is not null  
         AND zip != ''
         AND nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int not in (select workshop_id from manual where workshop_id is not null)
   ),

sections_schools --gets location based on the school of the facilitator for workshops in pegasus that did not have a zip location, as well as other sections
  AS(
    SELECT se.id as workshop_id, 
          'based on facilitator school' as processed_location,
           ss_user.state as state, 
           ss_user.zip as zip,      
           null::int as section_id
      FROM dashboard_production.sections se 
      JOIN tt_workshop_and_section_ids tt 
             ON se.id =  tt.section_id 
      JOIN dashboard_production_pii.users u  -- users just needed to get school_info_id
             ON se.user_id = u.id
      JOIN dashboard_production.school_infos si_user
             ON si_user.id = u.school_info_id
      JOIN analysis.school_stats ss_user
             ON ss_user.school_id = si_user.school_id
      WHERE ss_user.zip is not null 
          and ss_user.zip != ''
          and se.id not in (select workshop_id from sections_locations where workshop_id is not null)
          and se.id not in (select workshop_id from manual where workshop_id is not null)          
  ),

sections_geos -- matches any leftover workshops from above based on faciliator's user_geo
AS(
    SELECT 
        se.id as workshop_id,
        'based on facilitator geo' as processed_location, 
        CASE WHEN se.user_id = 1423830 then 'OH' ELSE ug.state END as state, -- 1423830 is only facilitator in this list not with user_geos in the US 
        CASE WHEN se.user_id = 1423830 then '44113' ELSE ug.postal_code END as zip,
         null::int as section_id
    FROM dashboard_production.sections se 
    JOIN tt_workshop_and_section_ids tt 
        ON se.id =  tt.section_id 
    JOIN dashboard_production_pii.user_geos ug
        ON se.user_id = ug.user_id
    where se.id not in (SELECT workshop_id from sections_schools where workshop_id is not null)
      and se.id not in (select workshop_id from sections_locations where workshop_id is not null)
      and se.id not in (select workshop_id from manual where workshop_id is not null) 
   -- and ug.country = 'United States'
  ),

section_state_zip 
AS(

     SELECT *
     FROM manual

    UNION ALL 

    SELECT *
    FROM sections_locations

    UNION ALL 

    SELECT *
    FROM sections_schools

    UNION ALL

    SELECT *
    FROM sections_geos

 ),
 
pd_workshop_based 
AS( 
  SELECT DISTINCT
         pde.user_id as user_id,
         pdw.course as course,
         pdw.id AS workshop_id, -- section_id in the other table (below)
         pdw.section_id AS section_id,
         CASE 
            WHEN (pdw.subject IN ('Intro Workshop', 'Intro') OR pdw.subject IS NULL)
                THEN 'Intro Workshop' 
            ELSE pdw.subject 
            END as subject,
         min(pds.start)::date as workshop_date,
         pdw.ended_at as workshop_date_pdw_ended_at, 
         date_part(month, workshop_date) month_workshop,
         date_part(dayofweek, workshop_date) day_of_week_workshop,
         CASE WHEN pdw.on_map = 1 THEN 'Public' WHEN pdw.on_map = 0 THEN 'Private' ELSE null END as audience,
         pdw.funded,
         pdw.funding_type,
         capacity,
         CASE WHEN pdw.regional_partner_id IS NOT NULL THEN 1 ELSE 0 END AS trained_by_regional_partner,-- using this definition for now for regional_partner_dash
         CASE WHEN pdw.funding_type = 'partner' THEN 1 ELSE 0 END AS trained_by_regional_partner_truth,  -- temporary until we figure out how ed team wants to present data to RPs
         CASE WHEN rp1.name IS NOT NULL THEN rp1.name
              WHEN rp2.name IS NOT NULL THEN rp2.name 
              ELSE 'No Partner' END 
              as regional_partner_name,
         coalesce (pdw.regional_partner_id, rpm.regional_partner_id) AS regional_partner_id,
         wsz.zip as zip,
         coalesce(sa.state_abbreviation, wsz.state) as state,
         wsz.processed_location as processed_location,
         u.name as facilitator_name,
         -- FIRST_VALUE(u.name) OVER (PARTITION BY u.studio_person_id  ORDER BY 1 DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ) as facilitator_name,
         u.studio_person_id as studio_person_id_facilitator,
         sy.school_year,
         min(CASE WHEN pds.start < DATEADD(day,-3,GETDATE()) and pda.id is null then 1 else 0 END) as not_attended,
         CASE WHEN pds.start > GETDATE() THEN 1 ELSE 0 END as future_event
     FROM dashboard_production_pii.pd_workshops pdw   -- does not start with teachers_trained_because this table also keeps track of workshops planned for the future
     JOIN dashboard_production_pii.pd_sessions pds 
        ON pdw.id = pds.pd_workshop_id  
     LEFT JOIN dashboard_production_pii.pd_enrollments pde
        ON pdw.id = pde.pd_workshop_id
     LEFT JOIN dashboard_production_pii.pd_attendances pda 
         ON pde.id = pda.pd_enrollment_id
         AND pda.deleted_at is null 
     LEFT JOIN dashboard_production_pii.pd_workshops_facilitators pdf
         ON pdw.id = pdf.pd_workshop_id
     LEFT JOIN dashboard_production_pii.users u
         ON u.id = pdf.user_id
     LEFT JOIN analysis.training_school_years sy 
         ON pds.start BETWEEN sy.started_at AND sy.ended_at
     LEFT JOIN workshop_state_zip wsz 
        ON wsz.workshop_id = pdw.id
     LEFT JOIN analysis.state_abbreviations sa
        ON sa.state_name = wsz.state 
        OR sa.state_abbreviation = wsz.state
     LEFT JOIN dashboard_production_pii.regional_partners rp1
        ON pdw.regional_partner_id = rp1.id   
     LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
        ON rpm.state = sa.state_abbreviation 
        OR rpm.zip_code = wsz.zip
     LEFT JOIN dashboard_production_pii.regional_partners rp2 
        ON  rpm.regional_partner_id = rp2.id  
    WHERE pdw.course = 'CS Fundamentals'
    AND   (pdw.subject IN ( 'Intro Workshop', 'Intro', 'Deep Dive')  or pdw.subject is null)
    group by 1, 2, 3, 4, 5,  7,   10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, u.name, 22, 23, 25
  ),
  
sections_based 
AS( 
    SELECT distinct 
         tt.user_id user_id,
         'CS Fundamentals' as course,
         coalesce(tt.workshop_id, tt.section_id) AS workshop_id,
         tt.section_id as section_id, -- using section_id as workshop_ids for those workshops not in pd_workshops
         'Intro Workshop' as subject,
         tt.trained_at as workshop_date,
         tt.trained_at as workshop_date_pdw_ended_at,
         date_part(month, tt.trained_at) month_workshop,
         date_part(dayofweek, tt.trained_at) day_of_week_workshop,
         JSON_EXTRACT_PATH_TEXT(forms.data_text,'type_s') as audience,
         null::smallint as funded,
         null as funding_type,
         case 
          when trim(JSON_EXTRACT_PATH_TEXT(forms.data_text,'capacity_s')) ~ '^[0-9]+$' 
            then trim(JSON_EXTRACT_PATH_TEXT(forms.data_text,'capacity_s'))  
           else null  
           end::int as capacity,
         0 AS trained_by_regional_partner,
         0 AS trained_by_reginal_partner_truth,  -- temporary until we figure out how ed team wants to present data to RPs
         CASE WHEN rp.name IS NOT NULL THEN rp.name ELSE 'No Partner' END as regional_partner_name,
         rpm.regional_partner_id AS regional_partner_id,
         ssz.zip as zip,
         coalesce(sa.state_abbreviation, ssz.state) as state,
         ssz.processed_location,
        -- coalesce(FIRST_VALUE(u.name) OVER (PARTITION BY u.studio_person_id  ORDER BY u.id DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ), forms.name) as facilitator_name,
         coalesce(u.name, forms.name) as facilitator_name,
         u.studio_person_id AS studio_person_id_facilitator,
         sy.school_year, 
         0 AS not_attended,
         0 AS future_event
    FROM analysis.csf_teachers_trained tt
    JOIN dashboard_production.sections se 
       ON se.id = tt.section_id 
    JOIN dashboard_production_pii.users u -- join to get facilitator data
       ON u.id = se.user_id
     JOIN analysis.training_school_years sy 
       ON tt.trained_at BETWEEN sy.started_at AND sy.ended_at
    LEFT JOIN section_state_zip ssz 
      ON  ssz.workshop_id = tt.section_id 
    LEFT JOIN analysis.state_abbreviations sa
      ON sa.state_name = ssz.state 
      OR sa.state_abbreviation = ssz.state -- join the sa table wether or not the ssz column is long form of name or short
    LEFT JOIN pegasus_pii.forms -- join to get additional data on the workshop
      ON  forms.kind = 'ProfessionalDevelopmentWorkshop'
      AND tt.section_id = nullif(json_extract_path_text(data_text, 'section_id_s'),'')::int 
    LEFT JOIN dashboard_production_pii.pd_regional_partner_mappings rpm 
      ON rpm.state = sa.state_abbreviation 
      OR rpm.zip_code = ssz.zip 
    LEFT JOIN dashboard_production_pii.regional_partners rp  
      ON rpm.regional_partner_id = rp.id 
    WHERE tt.workshop_id IS NULL   -- prevents double counting teachers and workshops that are recorded in pd_workshops *and* sections
   )

SELECT * from pd_workshop_based

UNION ALL

SELECT * from sections_based

WITH NO SCHEMA BINDING;
