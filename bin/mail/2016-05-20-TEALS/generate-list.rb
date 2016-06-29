#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# This is a follow-up email to ../2016-05-04-TEALS, targeting a wider audience (de-duped against the old list).
# Spec: https://docs.google.com/document/d/16KXH4E3M0WWhPUE25j6Sooa1CN1qtyjQ2sbHcbiNqJo/edit#heading=h.9hz1cfop5llo

# These values are arbitrary, based on need, from a snapshot of the data.
NUM_VOLUNTEERS_BY_STATE = {
  'Washington' => 249,
  'California' => 142,
  'New York' => 111,
  'Texas' => 92,
  'Virginia' => 82,
  'Arizona' => 72,
  'Massachusetts' => 69,
  'Georgia' => 48,
  'Rhode Island' => 40,
  'Oregon' => 20,
  'Florida' => 18,
  'North Dakota' => 17,
  'North Carolina' => 16,
  'Kentucky' => 15,
  'Illinois' => 14,
  'Indiana' => 14,
  'Michigan' => 14,
  'Minnesota' => 14,
  'South Carolina' => 13,
  'Louisiana' => 12,
  'Colorado' => 10,
  'Utah' => 9,
  'Pennsylvania' => 8,
  'District of Columbia' => 5
}.freeze

previously_contacted = Set.new
OLD_TEMPLATE = '2016-05-05-teals-volunteers'.freeze
old_email_recipients_query = %Q(
  SELECT DISTINCT contact_email
  FROM poste_deliveries
  JOIN poste_messages ON poste_messages.id = poste_deliveries.message_id
  WHERE poste_messages.name = '#{OLD_TEMPLATE}';
)
DB.fetch(old_email_recipients_query).each do |contact|
  previously_contacted.add contact[:contact_email]
end
puts "#{previously_contacted.length} previous contacts loaded."

volunteer_query = %q(
  (
    (
      kind_s: Petition &&
      role_s: engineer
    ) || (
      kind_s: VolunteerEngineerSubmission &&
      experience_s: software_professional &&
      NOT time_commitment_s: now_and_then &&
      allow_contact_b: true
    )
  ) && (
    create_ip_country_s: "United States" ||
    location_country_code_s: "US"
  )
)

results = {}
SOLR.query(q: volunteer_query).reverse_each do |result|
  next unless result
  email = result['email_s'].downcase.strip
  next if previously_contacted.include?(email) || UNSUBSCRIBERS[email]

  state = nil
  state = result['location_state_s'] if NUM_VOLUNTEERS_BY_STATE.key? result['location_state_s']
  state ||= result['create_ip_state_s'] if NUM_VOLUNTEERS_BY_STATE.key? result['create_ip_state_s']
  num_volunteers = state ? NUM_VOLUNTEERS_BY_STATE[state] : nil
  name = result['name_s']

  # Duplicate :name as :name_s because this email template uses :name_s as a greeting,
  # but :name is used for constructing the to line and stripped from params.
  results[email] = {
    email: email,
    name: name,
    name_s: name,
    state: state,
    num_volunteers: num_volunteers
  }
end

puts "#{results.length} volunteers."
export_contacts_to_csv results, 'volunteers.csv'
