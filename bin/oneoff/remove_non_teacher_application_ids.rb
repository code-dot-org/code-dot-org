#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

puts "Removing application ids that are not teacher applications ..."
modified_enrollments = []

Pd::Enrollment.where.not(application_id: nil).each do |enrollment|
  original_app_id = enrollment.application_id

  begin
    application = Pd::Application::ApplicationBase.find(original_app_id)
    if application.type != "Pd::Application::TeacherApplication"
      # The method set_application_id is triggered before a save
      # Save the enrollment to re-compute set_application_id
      enrollment.save!
      modified_enrollments << enrollment.id
    end
  rescue ActiveRecord::SubclassNotFound # Happens with Facilitator applications
    enrollment.save!
    modified_enrollments << enrollment.id
  end
end

puts "modified #{modified_enrollments.length} enrollments"
puts "enrollments modified: #{modified_enrollments}"
