#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

# - Have a registration_link of `nil` (we don't want to overwrite any existing links)
# - Not started
# - Not hidden
# - Course of: CSD, CSP, or CSA
# - Subject: 5-day summer

Pd::Workshop.where(started_at: nil, registration_link: nil, course: [Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSA], subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP).and(Pd::Workshop.where(hidden: false).or(Pd::Workshop.where(hidden: nil))).each do |ws|
  ws.update!(registration_link: ws.regional_partner&.link_to_partner_application.presence || "/pd/application/teacher")
end

# With registration link
# Started
# Hidden
# BYO
# CSD AYW (non-summer)

# CSD summer
# CSP summer
# CSA summer
# CSD summer with regional partner custom app link
