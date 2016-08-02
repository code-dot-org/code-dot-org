#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# Spec: https://docs.google.com/document/d/16KXH4E3M0WWhPUE25j6Sooa1CN1qtyjQ2sbHcbiNqJo/edit#heading=h.9hz1cfop5llo

# These values are arbitrary, based on need, from a snapshot of the data.
NUM_VOLUNTEERS_BY_STATE = {
  'Washington' => 249,
  'California' => 142,
  'New York' => 111,
  'Texas' => 9,
  'Virginia' => 82,
  'Arizona' => 72,
  'Massachusetts' => 69,
  'Georgia' => 48,
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
}

# Volunteer engineers in the US
volunteer_query = %q(
  kind_s: VolunteerEngineerSubmission2015 &&
  experience_s: software_professional &&
  volunteer_after_hoc_b: true &&
  time_commitment_s: (weekly OR more) && (
    create_ip_country_s: "United States" ||
    location_country_code_s: "US"
  )
)

results = {}
SOLR.query(q: volunteer_query).reverse_each do |result|
  next unless result

  state = nil
  state = result['location_state_s'] if NUM_VOLUNTEERS_BY_STATE.key? result['location_state_s']
  state ||= result['create_ip_state_s'] if NUM_VOLUNTEERS_BY_STATE.key? result['create_ip_state_s']
  num_volunteers = state ? NUM_VOLUNTEERS_BY_STATE[state] : nil
  email = result['email_s'].downcase.strip
  name = result['name_s']

  # Duplicate :name as :name_s because this email template uses :name as a greeting,
  # but :name is used for constructing the to line and stripped from params.
  results[email] = {
    email: email,
    name: name,
    name_s: name,
    state: state,
    num_volunteers: num_volunteers
  } unless UNSUBSCRIBERS[email]
end

puts "#{results.length} US volunteers."
export_contacts_to_csv results, 'volunteers.csv'
