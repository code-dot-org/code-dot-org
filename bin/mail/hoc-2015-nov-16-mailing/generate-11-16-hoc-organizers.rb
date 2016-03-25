#!/usr/bin/env ruby
require_relative '../mailing-common/mailing-list-utils'

# 11-16-hoc-organizers.md, sent to current organizers and non-organizers

# 2015 Organizers
query_subscribed_contacts(q: 'kind_s:HocSignup2015').values.each {|c| c[:organizer] = true}

# Non-organizers:
# 2013 CSedWeek organizers
query_subscribed_contacts(q: "kind_s:CSEdWeekEvent2013")

# 2014 Hour of Code organizers
query_subscribed_contacts(q: "kind_s:HocSignup2014")

# Code Studio teacher accounts
query_subscribed_contacts(q: "kind_s:user && role_s:teacher")

# *@microsoft.com and *@xbox.com emails
query_all_emails_at_domain('microsoft.com')
query_all_emails_at_domain('xbox.com')

ALL.values.each {|c| c[:organizer] = false unless c.has_key? :organizer}
export_contacts_to_csv ALL, "11-16-hoc-organizers.csv"
