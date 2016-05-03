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

# Next, filter for those who did not click through any of the previous petition emails (experiments or final).
PREVIOUS_MESSAGE_NAME_PREFIX = '4-22-petition-congress%'
CLICK_THROUGH_URL = 'http://bit.ly/computersciencepetition'
message_id_list = DB[:poste_messages].where(Sequel.like(:name, PREVIOUS_MESSAGE_NAME_PREFIX)).map(:id).join(',')
url_id = DB[:poste_urls].where(url: CLICK_THROUGH_URL).get(:id)
raise "Unable to find click through url (#{CLICK_THROUGH_URL})" unless url_id

# Including the entire email list in the query was causing problems, so
# splitting into smaller lists sent over multiple queries.
test_query_succeeded = false
results = {}
teachers.keys.each_slice(10000) do |teacher_emails|
  email_list = teacher_emails.map{|email| "\"#{email}\""}.join(',')

  # Run a test query with inner join to make sure we have click-through results before filtering
  unless test_query_succeeded
    test_query = <<-SQL
      SELECT COUNT(0) AS click_count FROM poste_deliveries
      INNER JOIN poste_clicks ON (poste_clicks.delivery_id = poste_deliveries.id AND poste_clicks.url_id = #{url_id})
      WHERE poste_deliveries.message_id IN (#{message_id_list}) AND
        contact_email IN (#{email_list})
    SQL
    test_query_succeeded = true if DB.fetch(test_query).get(:click_count) > 0
  end

  filter_query = <<-SQL
    SELECT contact_email FROM poste_deliveries
    LEFT JOIN poste_clicks ON (poste_clicks.delivery_id = poste_deliveries.id AND poste_clicks.url_id = #{url_id})
    WHERE poste_deliveries.message_id IN (#{message_id_list}) AND
      poste_clicks.id IS NULL AND
      contact_email IN (#{email_list})
  SQL

  DB.fetch(filter_query).map(:contact_email).each do |email|
    results[email] = teachers[email]
  end
end

raise 'No click-through results found. Check filter query.' unless test_query_succeeded

puts "#{results.length} teachers have not clicked through the previous survey link."
export_contacts_to_csv results, 'followup-teachers.csv'
