#!/usr/bin/env ruby
require_relative '../../../dashboard/config/environment'

PEGASUS_REPORTING_DB = sequel_connect CDO.pegasus_reporting_db_reader, CDO.pegasus_reporting_db_reader

# Processes a teacher application decisions file, and exports the relevant results files.
#
# Dependencies: it expects a workshops.csv file in the directory to map
# each workshop string (friendly name from teacher application) to workshop details.
# If a workshop string is encountered in decisions that is not in the mapping, an error will be raised.
#
# Usage:
#  1. instantiate an instance, which will load dependencies
#  2. call process_decisions to read and process a supplied decisions.csv file
#  3. call export_results to dump the relevant results files (only those that contain results)
#    - results_accept_teachercon.csv
#    - results_accept_partner.csv
#    - results_decline.csv
#    - results_waitlist.csv

class TeacherApplicationDecisionProcessor
  # This csv file is a necessary external dependency. The constructor will raise an error if it's missing.
  WORKSHOP_MAP_FILENAME = 'workshops.csv'.freeze
  WORKSHOP_MAP_HEADERS = {
    workshop_string: 'Workshop String',
    workshop_id: 'Workshop Id',
    partner_contact: 'Partner Contact',
    partner_email: 'Partner Email'
  }.freeze

  # Application ID, Decision (Accept, Decline, Waitlist), Workshop String (from matched list),
  # Primary Email, Program, and Partner Name (to override the implicit district-matched one, optional)
  DECISION_HEADERS = {
    application_id: 'Application ID',
    decision: 'Decision',
    workshop_string: 'Workshop',
    primary_email: 'Primary Email',
    program: 'Program',
    partner_name: 'Partner Name'
  }.freeze

  DECISIONS = {
    accept: 'Accept',
    decline: 'Decline',
    waitlist: 'Waitlist'
  }.freeze

  TEACHER_CONS = [
    'June 18 - 23, 2017: Houston',
    'July 16 - 21, 2017: Phoenix',
    'July 30 - August 4, 2017: Philadelphia'
  ].freeze

  # Array of string tuples. Replace any of the first strings with the second in partner names.
  PARTNER_NAME_OVERRIDES = [
    ['Share Fair Nation', 'mindSpark Learning (formerly Share Fair Nation)']
  ]

  attr_reader :results
  def initialize
    # Change working dir to this directory so all file names are local
    Dir.chdir __dir__

    # Maps workshop string (friendly name from teacher application) to
    #   [:id, :partner_name, :dates, :partner_contact, :partner_email]
    @workshop_map = load_workshop_map

    @results = {
      accept_teachercon: [],
      accept_partner: [],
      decline_csd: [],
      decline_csp: [],
      waitlist: []
    }
  end

  # Read and process a csv
  def process_decisions(filename)
    CSV.foreach(filename, headers: true).each do |row|
      process_decision_row row
    end
  end

  def process_decision_row(row)
    application_id = row[DECISION_HEADERS[:application_id]]
    teacher_application = Pd::TeacherApplication.find(application_id)
    decision = row[DECISION_HEADERS[:decision]]
    puts "Processing application #{application_id}: #{decision}"

    primary_email = row[DECISION_HEADERS[:primary_email]]
    if primary_email.present? && primary_email != teacher_application.primary_email
      update_primary_email teacher_application, primary_email
    end

    workshop_string = row[DECISION_HEADERS[:workshop_string]]
    program = row[DECISION_HEADERS[:program]].try(:downcase)
    regional_partner_override = row[DECISION_HEADERS[:partner_name]]

    # First, update the dashboard DB with the fields from the spreadsheet
    save_accepted_workshop teacher_application, program, workshop_string, regional_partner_override

    case decision
      when DECISIONS[:accept]
        process_accept teacher_application
      when DECISIONS[:decline]
        process_decline teacher_application
      when DECISIONS[:waitlist]
        process_waitlist teacher_application
      else
        raise "Unexpected decision #{decision} for application #{application_id}"
    end
  end

  def export_results
    @results.each do |key, results|
      # First, delete the existing file regardless of whether a new one will be created so
      # all result files are current (or nonexistent) after this is run.
      out_filename = "results_#{key}.csv"
      File.delete out_filename if File.exist? out_filename

      next if results.empty?
      puts "Exporting #{results.size} results to #{out_filename}"
      columns = results.first.keys
      CSV.open(out_filename, 'wb') do |csv|
        csv << columns
        results.each do |result|
          csv << columns.map {|column| result[column]}
        end
      end
    end
  end

  def load_workshop_map
    raise "Unable to find required dependency: #{WORKSHOP_MAP_FILENAME}" unless File.exist? WORKSHOP_MAP_FILENAME

    {}.tap do |workshop_map|
      CSV.foreach(WORKSHOP_MAP_FILENAME, headers: true).each do |row|
        workshop_string = row[WORKSHOP_MAP_HEADERS[:workshop_string]]
        workshop_id = row[WORKSHOP_MAP_HEADERS[:workshop_id]]
        next if workshop_id.blank?
        raise "Workshop #{workshop_id} not found." unless Pd::Workshop.exists?(workshop_id)

        # Workshop string is in the format "Partner Name: dates"
        partner_name, dates = workshop_string.split(':').map(&:strip)
        workshop_map[workshop_string] = {
          id: workshop_id,
          partner_name: partner_name,
          dates: dates,
          partner_contact: row[WORKSHOP_MAP_HEADERS[:partner_contact]],
          partner_email: row[WORKSHOP_MAP_HEADERS[:partner_email]]
        }
      end
      puts "#{workshop_map.size} workshop mappings loaded"
    end
  end

  def process(decision, teacher_application, params = {})
    raise "Unexpected decision: #{decision}" unless @results.key? decision

    email_params = Pd::TeacherApplicationEmailParams.new(teacher_application, params.merge({decision: decision}))
    raise "Error: #{email_params.errors.inspect}" unless email_params.valid?

    # Construct the final params, save to results, and return
    email_params.to_final_params.except(:decision).tap do |final_params|
      @results[decision] << final_params
    end
  end

  def process_accept(teacher_application)
    # There are 2 kinds of acceptance, TeacherCon (ours) and Regional Partner.
    if teacher_application.accepted_program.teachercon?
      process_accept_teachercon teacher_application
    else
      process_accept_partner teacher_application
    end
  end

  def process_accept_teachercon(teacher_application)
    regional_partner_name = teacher_application.regional_partner_name
    raise "Missing regional partner name for application id: #{teacher_application.id}" if regional_partner_name.blank?

    process :accept_teachercon, teacher_application
  end

  def process_accept_partner(teacher_application)
    # First, make sure this is a valid workshop string (lookup_workshop will raise an error otherwise)
    workshop_info = lookup_workshop teacher_application.accepted_workshop

    params = {
      regional_partner_name_s: workshop_info[:partner_name],
      regional_partner_contact_person_s: workshop_info[:partner_contact],
      regional_partner_contact_person_email_s: workshop_info[:partner_email],
      workshop_id_i: workshop_info[:id],
      workshop_dates_s: workshop_info[:dates]
    }
    process :accept_partner, teacher_application, params
  end

  def process_waitlist(teacher_application)
    process :waitlist, teacher_application
  end

  def process_decline(teacher_application)
    decision = get_decline_decision(teacher_application)
    process decision, teacher_application
  end

  def get_decline_decision(teacher_application)
    case teacher_application.selected_course
      when 'csd'
        :decline_csd
      when 'csp'
        :decline_csp
      else
        raise "Unrecognized course: #{teacher_application.selected_course} for teacher application #{teacher_application.id}"
    end
  end

  def save_accepted_workshop(teacher_application, program, accepted_workshop, regional_partner_override)
    update_fields = {}

    if program != teacher_application.selected_course
      puts "  Updating selected course from '#{teacher_application.selected_course}' to '#{program}'"
      update_fields[:selected_course] = program
    end

    if accepted_workshop != teacher_application.accepted_workshop
      puts "  Updating accepted workshop from '#{teacher_application.accepted_workshop}' to '#{accepted_workshop}'"
      update_fields[:accepted_workshop] = accepted_workshop
    end

    if regional_partner_override != teacher_application.regional_partner_name
      puts "  Updating regional partner from '#{teacher_application.regional_partner_name}' to '#{regional_partner_override}'"
      update_fields[:regional_partner_override] = regional_partner_override
    end

    teacher_application.update! update_fields unless update_fields.empty?
  end

  def update_primary_email(teacher_application, primary_email)
    puts "  Updating primary email from #{teacher_application.primary_email} to #{primary_email}"
    teacher_application.update!(primary_email: primary_email)
  end

  def lookup_workshop(workshop_string)
    raise "Unexpected workshop: #{workshop_string}" unless @workshop_map.key? workshop_string
    @workshop_map[workshop_string]
  end

  def apply_partner_name_overrides(partner_name)
    mutated_partner_name = partner_name.dup
    PARTNER_NAME_OVERRIDES.each do |override|
      mutated_partner_name.gsub!(override[0], override[1])
    end
    mutated_partner_name
  end
end
