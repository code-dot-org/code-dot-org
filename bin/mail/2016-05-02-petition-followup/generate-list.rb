#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# All US based teachers and HOC organizers who have not clicked through the previous petition email.

# First, get all US teachers and past organizers.
teacher_query = %q(
  ((kind_s:user && role_s:teacher) ||
  kind_s:HocSignup2015 || kind_s:HocSignup2014 || kind_s:CSEdWeekEvent2013) && (
    create_ip_country_s: "United States" ||
    hoc_country_s: "us" ||
    location_country_code_s: "US"
  )
)

fields = %w[email_s name_s]
teachers = query_subscribed_contacts(q: teacher_query, fl: fields)
puts "#{teachers.length} total US teachers and past HOC organizers."

# Next, filter for those who did not click through the previous email.
PREVIOUS_MESSAGE_NAME = '4-22-petition-congress-3b-no'
CLICK_THROUGH_URL = 'http://bit.ly/computersciencepetition'
message_id = DB[:poste_messages].where(name: PREVIOUS_MESSAGE_NAME).first[:id]
url_id = DB[:poste_urls].where(url: CLICK_THROUGH_URL).first[:id]

# Including the entire email list in the query was causing problems, so
# splitting into smaller lists sent over multiple queries.
results = {}
teachers.keys.each_slice(10000) do |teacher_emails|
  email_list = teacher_emails.map{|email| "\"#{email}\""}.join(',')
  filter_query = <<-SQL
    SELECT contact_email FROM poste_deliveries
    LEFT JOIN poste_clicks ON (poste_clicks.delivery_id = poste_deliveries.id AND poste_clicks.url_id = #{url_id})
    WHERE poste_deliveries.message_id = #{message_id} AND
      poste_clicks.id IS NULL AND
      contact_email IN (#{email_list})
  SQL

  DB.fetch(filter_query).map(:contact_email).each do |email|
    results[email] = teachers[email]
  end
end
puts "#{results.length} teachers have not clicked through the previous survey link."
export_contacts_to_csv results, 'followup-teachers.csv'
