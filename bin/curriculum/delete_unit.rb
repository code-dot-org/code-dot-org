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
  puts "Processing unit [#{unit_nm}]..."

  unit_to_del = Unit.find_by(name: unit_nm)
  raise "Unit with name #{unit_nm} not found" if unit_to_del.nil?

  # Ensure the unit getting deleted is not marked stable. Using the get_published_state method to address units that are part of unit groups
  # This would return the state for the unit if not null else fall back to return state of unit group
  raise "Published units (state set as 'Stable') cannot be deleted as they could have active sections and progress." unless unit_to_del.get_published_state != "stable"

  # Include additional warning if the script is not in one of the safe states where its not available for use externally.
  if unit_to_del.get_published_state != "in_development"
    print "Published state for Unit [#{unit_nm}] is not in_development, script might have usage. " \
      "Please confirm with curriculum team and ensure comms has been sent before deletion. Continue? (Y/N)"
    next unless gets.chomp.casecmp('y').zero?
  end

  assigned_section_count = Section.where(script_id: unit_to_del.id).count
  raise "Unit is currently assigned to some sections, deleting will break loading dashboard for those teachers." unless assigned_section_count == 0

  user_progress_count = UserScript.where(script_id: unit_to_del.id).count
  if user_progress_count > 0
    print "Some users have existing progress in unit [#{unit_nm}]. Continue? (Y/N)"
    next unless gets.chomp.casecmp('y').zero?
  end

  puts "No references to Unit [#{unit_nm}] found from sections. All validations for deletion passed."
  if options.dry_run
    puts "Skipping deletion due to dry run mode."
  else
    puts "Deleting Unit from DB."
    unit_to_del.destroy
  end
end
