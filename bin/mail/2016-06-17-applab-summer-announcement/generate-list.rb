#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# All HOC-organizers + petition-signers + code studio teachers
query = %q(
  (kind_s:user && role_s:teacher) ||
  kind_s:HocSignup2015 ||
  kind_s:HocSignup2014 ||
  kind_s:CSEdWeekEvent2013 ||
  kind_s:Petition
)

results = query_subscribed_contacts(q: query)
puts "#{results.count} contacts."

export_contacts_to_csv results, 'contacts.csv'
