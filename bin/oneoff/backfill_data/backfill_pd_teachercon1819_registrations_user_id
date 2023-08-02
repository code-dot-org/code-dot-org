#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

Pd::Teachercon1819Registration.find_each do |registration|
  if registration.pd_application_id?
    registration.update(user_id: registration.pd_application.user_id)
  elsif registration.regional_partner_id?
    # Educated guess on what user might have filled this out
    registration.update(user_id: registration.regional_partner.program_managers.first.id)
  end
end
