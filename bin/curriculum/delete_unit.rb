#!/usr/bin/env ruby

require 'json'
require 'optparse'

# Deletes a given script from the DB in the current environment
# after checking for the current state of script and possible references
# to script.

def parse_options
  OpenStruct.new.tap do |options|
    options.unit_names = nil
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = "Usage: #{$0} [options]"

      opts.separator ""

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to delete') do |unit_names|
        options.unit_names = unit_names
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without deleting any units.') do
        options.dry_run = true
      end

      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end

    opt_parser.parse!(ARGV)
  end
end

options = parse_options
raise "unit name is required. Use -h for options." if options.unit_names.nil?

require_relative '../../dashboard/config/environment'
options.unit_names.each do |unit_nm|
  unit_to_del = Unit.find_by(name: unit_nm)
  raise "Unit with name #{unit_nm} not found" if unit_to_del.nil?
  raise "Only units in_development can be deleted as they wouldn't have usage and hence any DB references." unless unit_to_del.published_state == "in_development"

  assigned_section_count = Section.where(script_id: unit_to_del.id).count
  raise "Unit is currently assigned to some sections, deleting will break loading dashboard for those teachers." unless assigned_section_count == 0

  user_progress_count = UserScript.where(script_id: unit_to_del.id).count
  raise "Some users have existing progress in this unit" unless user_progress_count == 0

  puts "No references to Unit found from sections or user progress."
  if options.dry_run
    puts "Skipping deletion due to dry run mode."
  else
    puts "Deleting Unit from DB."
    unit_to_del.destroy
  end
end
