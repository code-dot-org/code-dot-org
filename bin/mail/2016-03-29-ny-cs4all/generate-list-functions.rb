#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'active_support'
require 'active_support/core_ext/object/blank'

# Gather all email addresses *@schools.nyc.gov who are (any of):
# A. Code Studio teachers who have already been through the K-5 PD.
# B. Code Studio teachers who have not been through any PD.
# C. Hour of Code teachers who aren't on Code Studio.

def query_dashboard_teachers(query)
  {}.tap do |results|
    DASHBOARD_DB.fetch(query).each do |teacher|
      email = teacher[:email]
      results[email] = {email: email, name: teacher[:name], id: teacher[:id]}
    end
  end
end

def query_k5_pd_section_ids
  DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshop').map(:data).
    map{|form_data| JSON.parse(form_data)['section_id_s']}.reject(&:blank?).map(&:to_i)
end

# A. Query Code Studio teachers who have already been through the K-5 PD.
def query_k5_pd_teachers
  section_ids = query_k5_pd_section_ids
  puts "#{section_ids.count} K5 workshop section Ids loaded."

  k5_pd_teachers = query_dashboard_teachers %Q(
    SELECT DISTINCT culled_users.id, culled_users.email, culled_users.name
    FROM (
      SELECT * FROM users WHERE user_type = 'teacher' AND email like '%@schools.nyc.gov'
    ) AS culled_users
    JOIN followers ON (followers.student_user_id = culled_users.id)
    JOIN sections ON (sections.id = followers.section_id)
    WHERE sections.id in (#{section_ids.to_a.join(',')})
  )
  puts "#{k5_pd_teachers.length} @schools.nyc.gov k5-pd teachers."
  k5_pd_teachers
end

# B. Query Code Studio teachers who have not been through any PD.
# We already have k5 workshop teachers above. Get ops workshop teachers,
# combine them, and query the complement (i.e. teachers not in either).
def query_non_pd_teachers(k5_pd_teachers)
  ops_pd_teachers = query_dashboard_teachers %Q(
    SELECT DISTINCT culled_users.id, culled_users.email, culled_users.name
    FROM (
      SELECT * FROM users WHERE user_type = 'teacher' AND email LIKE '%@schools.nyc.gov'
    ) AS culled_users
    JOIN workshop_attendance ON (workshop_attendance.teacher_id = culled_users.id)
    JOIN segments ON (segments.id = workshop_attendance.segment_id)
    JOIN workshops ON (workshops.id = segments.workshop_id)
  )
  puts "#{ops_pd_teachers.length} @schools.nyc.gov ops-pd teachers."

  all_pd_teachers_ids = k5_pd_teachers.merge(ops_pd_teachers).values.map{|teacher| teacher[:id]}
  non_pd_teachers = query_dashboard_teachers %Q(
    SELECT DISTINCT users.email, users.name
    FROM users
    WHERE users.user_type = 'teacher' AND users.email like '%schools.nyc.gov'
      AND users.id NOT IN (#{all_pd_teachers_ids.join(',')})
  )
  puts "#{non_pd_teachers.length} @schools.nyc.gov non-pd teachers (not in k5 or ops pd)."
  non_pd_teachers
end

# C. Hour of Code teachers who aren't on Code Studio.
def query_hoc_organizers_no_code_studio
  hoc_organizer_query = 'kind_s:HocSignup2015 || kind_s:HocSignup2014 || kind_s:CSEdWeekEvent2013'
  hoc_organizers = query_subscribed_contacts(q: hoc_organizer_query).select do |email,_|
    email.end_with? '@schools.nyc.gov'
  end
  puts "#{hoc_organizers.length} total @schools.nyc.gov hoc organizers (including code studio users)."

  hoc_organizer_code_studio_users = query_dashboard_teachers %Q(
    SELECT email FROM users
    WHERE email IN (#{hoc_organizers.keys.map{|email|"'#{email}'"}.join(',')})
  )
  puts "#{hoc_organizer_code_studio_users.length} of those are code studio users."

  # Remove all the code studio users from hoc_organizers set.
  hoc_organizers_no_code_studio = hoc_organizers.except(*hoc_organizer_code_studio_users.keys)
  puts "#{hoc_organizers_no_code_studio.length} hoc organizers who aren't on code studio."
  hoc_organizers_no_code_studio
end
