#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'active_support'
require 'active_support/core_ext/object/blank'

def query_dashboard_teachers(query)
  {}.tap do |results|
    DASHBOARD_DB.fetch(query).each do |teacher|
      email = teacher[:email]
      results[email] = {email: email, name: teacher[:name], id: teacher[:id]}
    end
  end
end

def query_workshop_section_ids
  DASHBOARD_DB.fetch("SELECT id FROM sections WHERE section_type LIKE '%workshop'").map(:id)
end

# PD comes in 3 forms: old ops workshops, old K5 workshops, and new pd_workshops.
# The old ops workshop attendance is tracked in teacher_attendance.
# For the old K5 and all the new workshops, we can track teachers through section membership.
def query_all_pd_teachers
  ops_pd_teachers = query_dashboard_teachers <<-SQL
    SELECT DISTINCT users.id, users.email, users.name
    FROM users
    JOIN workshop_attendance ON (workshop_attendance.teacher_id = users.id)
    JOIN segments ON (segments.id = workshop_attendance.segment_id)
    JOIN workshops ON (workshops.id = segments.workshop_id)
    WHERE users.user_type = 'teacher'
  SQL

  section_ids = query_workshop_section_ids
  section_based_pd_teachers = query_dashboard_teachers <<-SQL
    SELECT DISTINCT users.id, users.email, users.name
    FROM sections
    JOIN followers ON (followers.section_id = sections.id)
    JOIN users ON (users.id = followers.student_user_id)
    WHERE sections.id IN (#{section_ids.join(',')}) AND users.user_type = 'teacher'
  SQL

  # Merge the hashes, which will dedupe since email is they key
  section_based_pd_teachers.merge ops_pd_teachers
end

def query_us_teachers_and_hoc_organizers
  query = <<-SOLR
    (
      (kind_s:user && role_s:teacher) ||
      kind_s:(HocSignup2016 OR HocSignup2015 OR HocSignup2014 OR CSEdWeekEvent2013)
    ) && (
      create_ip_country_s: "United States" ||
      hoc_country_s: "us" ||
      location_country_code_s: "US"
    )
  SOLR

  query_subscribed_contacts q: query
end

def query_international_teachers_and_hoc_organizers
  query = <<-SOLR
    (
      (kind_s:user && role_s:teacher) ||
      kind_s:(HocSignup2016 OR HocSignup2015 OR HocSignup2014 OR CSEdWeekEvent2013)
    ) && NOT (
      create_ip_country_s: "United States" ||
      hoc_country_s: "us" ||
      location_country_code_s: "US"
    )
  SOLR

  query_subscribed_contacts q: query
end
