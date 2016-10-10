#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# All code studio teachers
results = query_subscribed_contacts(q: 'kind_s:user && role_s:teacher')
puts "#{results.count} teachers."
export_contacts_to_csv results, 'teachers.csv'
