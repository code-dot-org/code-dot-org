#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# This is a followup email for the 2016-09-27-hoc-volunteer-launch and uses the same recipient query
contacts = query_subscribed_contacts q: 'kind_s:VolunteerEngineerSubmission2015'

# Add name_s field, copied from name, because name_s is referenced in the template and name is stripped out here:
# https://github.com/code-dot-org/code-dot-org/blob/cefeb5a0f90b06a65281187ef3ff40b5eb93d83e/bin/mail/send-to-mailing-list#L77
contacts.values.each do |contact|
  contact[:name_s] = contact[:name]
end

puts "#{contacts.count} contacts."
export_contacts_to_csv contacts, 'contacts.csv'
