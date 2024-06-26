#!/usr/bin/env ruby

require 'json'
require 'optparse'

# Given a unit name, the script will iterate over all the sections that
# have the unit assigned and remove that association by setting assigned
# unit for those sections to null.

def parse_options
  OpenStruct.new.tap do |options|
    options.unit_names = nil
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = "Usage: #{$0} [options]"

      opts.separator ""

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to remove all section associations') do |unit_names|
        options.unit_names = unit_names.map(&:strip)
      end

      opts.on('-n', '--dry-run', 'List out the count sections that would be impacted.') do
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
  unit_to_remove_sec_association = Unit.find_by(name: unit_nm)
  raise "Unit with name #{unit_nm} not found" if unit_to_remove_sec_association.nil?

  assigned_sections = Section.where(script_id: unit_to_remove_sec_association.id)
  puts "Number of sections that have unit #{unit_nm} associated: #{assigned_sections.count}."

  if options.dry_run
    puts "Skipping section update due to dry run mode."
  elsif assigned_sections.count > 0
    puts "Removing all section assignments."
    assigned_sections.update_all(script_id: nil)
  end
end
