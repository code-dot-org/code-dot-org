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

$quiet = false
def warn(str)
  puts str unless $quiet && !$verbose
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

        Example: #{$0} -u dance -p /hoc/plugged/8
        Example: #{$0} -l -u dance -p /hoc/plugged/8
        Example: #{$0} -u dance -p /hoc/plugged/8 -m Lesson,Activity
      BANNER

      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-m', '--models Lesson,Activity,Resource,Objective,Vocabulary,ProgrammingExpression,Standard', Array, 'Models to import (default: all)') do |models|
        options.models = models
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on('-p', '--lesson_path /hoc/plugged/1', 'path to lesson plan on curriculum builder. ') do |lesson_path|
        options.lesson_path = lesson_path
      end

      opts.on('-q', '--quiet', 'Silence warnings.') do
        $quiet = true
      end

      opts.on('-u', '--unit_name unit-name-1,unit-name-2', Array, 'Unit name to import. The unit must have only one lesson.') do |unit_names|
        options.unit_names = unit_names
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
    unit = Script.find_by_name!(unit_name)
    if unit.lessons.count != 1
      raise "hoc unit #{unit.name.dump} must have only one lesson, but found: #{unit.lessons.map(&:name)}"
    end
    log "found code studio unit named #{unit.name.dump} with id #{unit.id}"
    lesson = unit.lessons.first

    cb_url_prefix = options.local ? 'http://localhost:8000' : 'http://www.codecurricula.com'

    # If a path is not found, curriculum builder returns a 302 redirect the same
    # path with the /en-us prefix, which then returns 404. to make error
    # handling a bit easier, just include the /en-us prefix so that we get a 404
    # on the first try if the path cannot be found.
    url = "#{cb_url_prefix}/en-us#{options.lesson_path}.json?format=json"

    cb_lesson_json = fetch(url)
    cb_lesson = JSON.parse(cb_lesson_json)

    next if options.dry_run

    LessonImportHelper.update_lesson(lesson, options.models, cb_lesson)
    log("update lesson #{lesson.id} with cb lesson data: #{cb_lesson.to_json[0, 50]}...")

    unless unit.is_migrated
      unit.update!(
        is_migrated: true,
        use_legacy_lesson_plans: true
      )
    end

    unit.lessons.first.update!(has_lesson_plan: true)

    Dir.chdir("#{Rails.root}/../pegasus/sites.v3/code.org/public/curriculum") do
      filename = "#{unit_name}/1/Teacher.moved"
      unless File.exist?(filename)
        log "creating #{`pwd`.strip}/#{filename}"
        raise unless system("mkdir -p #{unit_name}/1")
        File.write(filename, "https://curriculum.code.org#{options.lesson_path}/")
      end
    end

    unit.fix_script_level_positions
    unit.write_script_json

    puts "successfully updated unit #{unit.name}"
  end
end

def fetch(url)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)
  raise "HTTP status #{response.code} fetching #{uri}" unless response.is_a? Net::HTTPSuccess
  body = response.body
  log "fetched #{body.length} bytes of lesson json from #{uri}"
  body
end

options = parse_options
raise "unit_names is required. Use -h for options." unless options.unit_names.present?
raise "lesson_path is required. Use -h for options." unless options.lesson_path.present?
options.models ||= %w(Lesson Activity Resource Objective Vocabulary ProgrammingExpression Standard)

require_rails_env
main(options)
