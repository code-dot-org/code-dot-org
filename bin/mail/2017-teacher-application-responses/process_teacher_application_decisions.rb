#!/usr/bin/env ruby
require_relative './teacher_application_decision_processor'

# This script reads a dscisions csv file (specified on the command line), and processes each row.
# It generates a results_type file for each type in the decisions file,
# which can be then used to send emails with send_real_emails.
#
# It also updates each relevant teacher application in the DB with accepted_workshop and
# selected_course (in the case of Accept), and a new primary_email (where specified).
# More details in teacher_application_decision_processor.rb

teacher_decisions_filename = ARGV[0]
unless teacher_decisions_filename
  puts 'Usage process_teacher_application_decisions.rb teacher_decisions.csv'
  exit 1
end

processor = TeacherApplicationDecisionProcessor.new
processor.process_decisions teacher_decisions_filename
processor.export_results
