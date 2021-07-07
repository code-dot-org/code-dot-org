#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

puts "Updating principal approval applications...\n\n"
# Update capitalization on each principal approval application and save it,
# then update, save, and score its corresponding teacher application
Pd::Application::PrincipalApprovalApplication.find_each do |principal_application|
  if principal_application.form_data.include?("(please explain)")
    principal_application.form_data = principal_application.form_data.gsub("(please explain)", "(Please Explain)")
    principal_application.save
    if principal_application.errors
      puts "principal app: #{principal_application.id} errors: #{principal_application.errors.full_messages}"
      next
    end

    principal_response = principal_application.sanitize_form_data_hash

    response = principal_response.values_at(:replace_course, :replace_course_other).compact.join(": ")
    replaced_courses = principal_response.values_at(:replace_which_course_csp, :replace_which_course_csd).compact.join(', ')
    replace_course_string = "#{response}#{replaced_courses.present? ? ': ' + replaced_courses : ''}".gsub('::', ':')

    teacher_application = Pd::Application::TeacherApplication.where(application_guid: principal_application.application_guid).first

    teacher_application.update_form_data_hash(
      {
        principal_approval: principal_response.values_at(:do_you_approve, :do_you_approve_other).compact.join(" "),
        schedule_confirmed: principal_response.values_at(:committed_to_master_schedule, :committed_to_master_schedule_other).compact.join(" "),
        diversity_recruitment: principal_response.values_at(:committed_to_diversity, :committed_to_diversity_other).compact.join(" "),
        free_lunch_percent: principal_response[:free_lunch_percent],
        underrepresented_minority_percent: principal_application.underrepresented_minority_percent.to_s,
        wont_replace_existing_course: replace_course_string,
        can_pay_fee: principal_response[:pay_fee]
      }
    )
    teacher_application.save
    if teacher_application.errors
      puts "teacher app: #{teacher_application.id} errors: #{teacher_application.errors.full_messages}"
      next
    end
    teacher_application.auto_score!
  end
end

puts "\nUpdating teacher applications...\n\n"
# Update capitalization on each teacher application, update it from its principal approval,
# save it, then autoscore it
Pd::Application::TeacherApplication.find_each do |teacher_application|
  if teacher_application.form_data.include?("(please explain)")
    teacher_application.form_data = teacher_application.form_data.gsub("(please explain)", "(Please Explain)")

    principal_application = Pd::Application::PrincipalApprovalApplication.where(application_guid: teacher_application.application_guid).first
    if principal_application

      principal_response = principal_application.sanitize_form_data_hash

      response = principal_response.values_at(:replace_course, :replace_course_other).compact.join(": ")
      replaced_courses = principal_response.values_at(:replace_which_course_csp, :replace_which_course_csd).compact.join(', ')
      replace_course_string = "#{response}#{replaced_courses.present? ? ': ' + replaced_courses : ''}".gsub('::', ':')

      teacher_application.update_form_data_hash(
        {
          principal_approval: principal_response.values_at(:do_you_approve, :do_you_approve_other).compact.join(" "),
          schedule_confirmed: principal_response.values_at(:committed_to_master_schedule, :committed_to_master_schedule_other).compact.join(" "),
          diversity_recruitment: principal_response.values_at(:committed_to_diversity, :committed_to_diversity_other).compact.join(" "),
          free_lunch_percent: principal_response[:free_lunch_percent],
          underrepresented_minority_percent: principal_application.underrepresented_minority_percent.to_s,
          wont_replace_existing_course: replace_course_string,
          can_pay_fee: principal_response[:pay_fee]
        }
      )
    end
    teacher_application.save
    if teacher_application.errors
      puts "teacher app: #{teacher_application.id} errors: #{teacher_application.errors.full_messages}"
      next
    end
    teacher_application.auto_score!
  end
end
