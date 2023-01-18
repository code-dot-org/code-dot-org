#!/usr/bin/env ruby

# As part of deprecating facilitator models, we are soft deleting
# applications of type "Pd::Application::Facilitator1819Application"
# "Pd::Application::Facilitator1920Application"

require_relative '../../dashboard/config/environment'

puts "Soft deleting facilitator applications ...\n\n"

records_deleted = []

not_deprecated_application_types = %w[Pd::Application::PrincipalApprovalApplication Pd::Application::TeacherApplication]
Pd::Application::ApplicationBase.where.not(type: not_deprecated_application_types).each do |application|
  application.destroy!
  records_deleted << application.id
end

puts "Deleted #{records_deleted.length} applications"
puts "Applications deleted: #{records_deleted}"
