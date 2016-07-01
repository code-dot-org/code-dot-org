#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# All US contacts
# Note: these conditions were copied from our list of possible fields to determine US/international, with some
# removed for redundancy or because they never appear. Source:
# https://github.com/code-dot-org/code-dot-org/blob/staging/bin/mail/mailing-common/mailing-list-utils.rb#L38-L38
us_contacts_query = %q(
  !(role_s: student) && (
    create_ip_country_s: "United States" ||
    hoc_country_s: "us" ||
    location_country_code_s: "US"
  )
)

fields = %w[email_s name_s]
us_contacts = query_subscribed_contacts(q: us_contacts_query, fl: fields)

puts "#{us_contacts.length} US contacts."
export_contacts_to_csv us_contacts, 'us-contacts.csv'

# Split up for 12 A/B test formats at .4% each, leaving 95.2% for the final mail
puts 'splitting us-contacts.csv'
puts `../mailing-common/split ./us-contacts.csv #{' .4' * 12}`
