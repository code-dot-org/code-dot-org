#!/usr/bin/env ruby

require 'json'
require 'optparse'
require 'uri'
require 'net/http'
require_relative '../../deployment'
require 'cdo/lesson_import_helper'

raise unless [:development, :adhoc, :levelbuilder].include? rack_env

$verbose = false
def log(str)
  puts str if $verbose
end

# Wait until after initial error checking before loading the rails environment.
def require_rails_env
  log "loading rails environment..."
  start_time = Time.now
  require_relative '../../dashboard/config/environment'
  log "rails environment loaded in #{(Time.now - start_time).to_i} seconds."
end

def parse_options
  OpenStruct.new.tap do |options|
    options.local = false
    options.unit_name = nil
    options.dry_run = false

    opt_parser = OptionParser.new do |opts|
      opts.banner = <<~BANNER

        Usage: #{$0} [options]

        Example: #{0} -u coursea-2021
        Example: #{0} -u csp2-2021,csp3-2021,csp4-2021
      BANNER

      opts.separator ""

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to import') do |unit_names|
        options.unit_names = unit_names
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on('-v', '--verbose', 'Use verbose debug logging.') do
        $verbose = true
      end

      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end

    opt_parser.parse!(ARGV)
  end
end

def main(options)
  options.unit_names.each do |unit_name|
    script = Script.find_by_name!(unit_name)
    log "found code studio script name #{script.name} with id #{script.id}"

    if script.is_migrated?
      log "skipping script #{script.name.dump} because it is already migrated"
      next
    end

    next if options.dry_run

    models = ['Lesson', 'Activity']
    script.lessons.each do |lesson|
      LessonImportHelper.update_lesson(lesson, models)
    rescue => e
      raise e, "Error migrating unit #{script.name.dump} lesson #{lesson.name.dump}: #{e}", e.backtrace
    end

    has_lesson_plans = script.lessons.any?(&:has_lesson_plan)
    script.update!(
      is_migrated: true,
      # by default, we'll use code studio lesson plans for migrated scripts
      # unless use_legacy_lesson_plans is set. therefore, if the script has
      # any lesson plans, then we need to set this in order to preserve any
      # existing links to lesson plans.
      use_legacy_lesson_plans: has_lesson_plans,
      skip_name_format_validation: true
    )
    script.fix_script_level_positions
    script.write_script_json

    log "updated unit #{script.name}"
  end
end

options = parse_options
raise "unit name is required. Use -h for options." unless options.unit_names.present?

require_rails_env
main(options)
