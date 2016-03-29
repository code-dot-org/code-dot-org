#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'set'

# email addresses *@schools.nyc.gov who are (any of):
# a- Code Studio teachers who have already been through the K-5 PD
# b- Code Studio teachers who have not been through any PD
# c- Hour of Code teachers who aren't on Code Studio.

def query_dashboard_teachers(query)
  {}.tap do |results|
    DASHBOARD_DB.fetch(query).each do |teacher|
      email = teacher[:email]
      results[email] = {email: email, name: teacher[:name], id: teacher[:id]}
    end
  end
end

# a- Code Studio teachers who have already been through the K-5 PD
SECTION_IDS = Set.new
SOLR_PARAMS = {
  q: 'kind_s:ProfessionalDevelopmentWorkshop',
  fl: 'section_id_s',
  rows: 10000
}
SOLR.query(SOLR_PARAMS).each do |record|
  next if record['section_id_s'].to_s == ''
  SECTION_IDS << record['section_id_s']
end
puts "#{SECTION_IDS.count} K5 workshop section Ids loaded from solr"

k5_pd_teachers = query_dashboard_teachers <<eos
  SELECT DISTINCT culled_users.id, culled_users.email, culled_users.name
  FROM (
    SELECT * FROM users WHERE email like '%@schools.nyc.gov'
  ) AS culled_users
  JOIN followers ON (followers.student_user_id = culled_users.id)
  JOIN sections ON (sections.id = followers.section_id)
  WHERE sections.id in (#{SECTION_IDS.to_a.join(',')})
eos
puts "#{k5_pd_teachers.length} @schools.nyc.gov k5-pd teachers"

# b- Code Studio teachers who have not been through any PD
# we already have k5 workshop teachers above. get ops workshop teachers,
# combine them and query the complement (i.e. teachers not in either)
ops_pd_teachers = query_dashboard_teachers <<eos
  SELECT DISTINCT culled_users.id, culled_users.email, culled_users.name
  FROM (
    SELECT * FROM users WHERE email like '%@schools.nyc.gov'
  ) AS culled_users
  JOIN workshop_attendance ON (workshop_attendance.teacher_id = culled_users.id)
  JOIN segments ON (segments.id = workshop_attendance.segment_id)
  JOIN workshops ON (workshops.id = segments.workshop_id)
eos
puts "#{ops_pd_teachers.length} @schools.nyc.gov ops-pd teachers"

all_pd_teachers_ids = k5_pd_teachers.merge(ops_pd_teachers).values.map{|teacher| teacher[:id]}
non_pd_teachers = query_dashboard_teachers <<eos
  SELECT DISTINCT users.email, users.name
  FROM users
  WHERE users.email like '%schools.nyc.gov'
    AND users.id NOT IN (#{all_pd_teachers_ids.join(',')})
eos
puts "#{non_pd_teachers.length} @schools.nyc.gov non-pd teachers (not in k5 or ops pd)"

# c- Hour of Code teachers who aren't on Code Studio.
hoc_organizer_query = 'kind_s:HocSignup2015 || kind_s:HocSignup2014 || kind_s:CSEdWeekEvent2013'
hoc_organizers = query_subscribed_contacts(q: hoc_organizer_query).select do |email,_|
  email.end_with? '@schools.nyc.gov'
end
puts "#{hoc_organizers.length} total @schools.nyc.gov hoc organizers (including code studio users)"
hoc_organizer_code_studio_users = query_dashboard_teachers <<eos
  SELECT email FROM users WHERE email IN (#{hoc_organizers.keys.map{|email|"'#{email}'"}.join(',')})
eos
puts "#{hoc_organizer_code_studio_users.length} of those are code studio users"
# remove all the code studio users from hoc_organizers set
hoc_organizer_code_studio_users.each_key do |email|
  hoc_organizers.delete(email)
end
puts "#{hoc_organizers.length} hoc organizers who aren't on code studio"

all_results = k5_pd_teachers.merge(non_pd_teachers).merge(hoc_organizers)
puts "#{all_results.length} teachers"
export_contacts_to_csv ALL, 'teachers.csv'
