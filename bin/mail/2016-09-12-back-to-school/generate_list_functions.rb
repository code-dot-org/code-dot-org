#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'
require 'active_support'
require 'active_support/core_ext/object/blank'

@all_emails = Set.new

def dedupe(contacts)
  contacts.except! *@all_emails
  @all_emails.merge contacts.keys
  contacts
end

def query_dashboard_teachers(query)
  {}.tap do |results|
    DASHBOARD_DB.fetch(query).each do |teacher|
      email = teacher[:email]
      results[email] = {email: email, name: teacher[:name], id: teacher[:id]}
    end
  end
end

def query_k5_workshop_section_ids
  DASHBOARD_DB.fetch(
    "SELECT id FROM sections WHERE section_type = 'csf_workshop'"
  ).map(:id)
end

def query_6_12_workshop_section_ids
  DASHBOARD_DB.fetch(
    "SELECT id FROM sections WHERE section_type LIKE '%workshop' AND section_type <> 'csf_workshop'"
  ).map(:id)
end

def query_teachers_from_pd_sections(section_ids)
  query_dashboard_teachers <<-SQL
    SELECT DISTINCT users.id, users.email, users.name
    FROM sections
    INNER JOIN followers ON followers.section_id = sections.id
    INNER JOIN users ON users.id = followers.student_user_id
    WHERE sections.id IN (#{section_ids.join(',')})
      AND users.email IS NOT NULL AND users.email <> ''
  SQL
end

# PD comes in 3 forms: old ops workshops, old K5 workshops, and new pd_workshops.
# K5 teachers from both the old K5 workshops and the new workshops can be tracked through
# csf_workshop section membership.
def query_k5_pd_teachers
  query_teachers_from_pd_sections query_k5_workshop_section_ids
end

# The old ops workshop attendance is tracked in teacher_attendance.
# For new workshops, we can track teachers through section membership.
def query_6_12_pd_teachers
  ops_pd_teachers = query_dashboard_teachers <<-SQL
    SELECT DISTINCT users.id, users.email, users.name
    FROM users
    INNER JOIN workshop_attendance ON workshop_attendance.teacher_id = users.id
    INNER JOIN segments ON segments.id = workshop_attendance.segment_id
    INNER JOIN workshops ON workshops.id = segments.workshop_id
    WHERE users.email IS NOT NULL AND users.email <> ''
  SQL

  section_based_pd_teachers = query_teachers_from_pd_sections query_6_12_workshop_section_ids

  # Merge the hashes, which will dedupe since email is the key
  section_based_pd_teachers.merge ops_pd_teachers
end

def query_us_teachers
  query = <<-SOLR
    (
      kind_s:user && role_s:teacher
    ) && (
      create_ip_country_s: "United States" ||
      hoc_country_s: "us" ||
      location_country_code_s: "US"
    )
  SOLR

  query_subscribed_contacts q: query
end

def query_international_teachers
  query = <<-SOLR
    (
      kind_s:user && role_s:teacher
    ) && NOT (
      create_ip_country_s: "United States" ||
      hoc_country_s: "us" ||
      location_country_code_s: "US"
    )
  SOLR

  query_subscribed_contacts q: query
end
