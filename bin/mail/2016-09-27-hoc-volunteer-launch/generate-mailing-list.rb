#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

contacts = query_subscribed_contacts q: 'kind_s:VolunteerEngineerSubmission2015'
puts "#{contacts.count} contacts."
export_contacts_to_csv contacts, 'contacts.csv'
