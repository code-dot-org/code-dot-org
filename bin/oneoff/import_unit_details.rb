#!/usr/bin/env ruby

require 'json'
require 'optparse'
require 'uri'
require 'net/http'
require_relative '../../deployment'

# Once this script is ready, only levelbuilder should be added to this list.
raise unless [:development, :adhoc].include? rack_env

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

        Example: runner.rb -u coursea-2021
        Example: runner.rb -l -u csd1-2021
        Example: runner.rb -l -u csp2-2021,csp3-2021,csp4-2021
      BANNER

      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to import') do |unit_names|
        options.unit_names = unit_names
      end

      opts.on('-n', '--dry-run', 'Perform basic validation without importing any data.') do
        options.dry_run = true
      end

      opts.on('-q', '--quiet', 'Silence warnings.') do
        $quiet = true
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
  cb_url_prefix = options.local ? 'http://localhost:8000' : 'https://curriculum.code.org'

  options.unit_names.each do |unit_name|
    script = Script.find_by_name!(unit_name)
    log "found code studio script name #{script.name} with id #{script.id}"

    # If a path is not found, curriculum builder returns a 302 redirect the same
    # path with the /en-us prefix, which then returns 404. to make error
    # handling a bit easier, just include the /en-us prefix so that we get a 404
    # on the first try if the script cannot be found.
    url = "#{cb_url_prefix}/en-us/export/unit/#{unit_name}.json?format=json"
    cb_unit_json = fetch(url)

    cb_unit = JSON.parse(cb_unit_json)
    validate_unit(script, cb_unit)
    chapters = get_validated_chapters(cb_unit)
    lesson_pairs = get_validated_lesson_pairs(script, chapters)
    log lesson_pairs.join("\n")
  end
end

def fetch(url)
  uri = URI(url)
  response = Net::HTTP.get_response(uri)
  raise "HTTP status #{response.code} fetching #{uri}" unless response.is_a? Net::HTTPSuccess
  body = response.body
  log "fetched #{body.length} bytes of unit json from #{uri}"
  body
end

def validate_unit(script, cb_unit)
  raise "unexpected unit_name #{cb_unit['unit_name']}" unless cb_unit['unit_name'] == script.name
end

def get_validated_chapters(cb_unit)
  # In 2020, CSF and CSD lessons are all inside chapters, and CSP does not use
  # chapters. Therefore, we can simplify the merge logic by assuming that
  # lessons are all inside chapters when chapters are present.
  if cb_unit['chapters'].present? && cb_unit['lessons'].present?
    raise "found #{cb_unit['lessons'].count} unexpected lessons outside of chapters"
  end

  if cb_unit['chapters'].blank? && cb_unit['lessons'].blank?
    raise "no chapters or lessons found"
  end

  cb_unit['chapters'].presence || [{'lessons' => cb_unit['lessons']}]
end

def get_validated_lesson_pairs(script, chapters)
  validated_lesson_pairs = []

  cb_lessons = chapters.map {|ch| ch['lessons']}.flatten

  # Compare non-lockable lessons from CB and Code Studio.
  lessons_nonlockable = script.lessons.reject(&:lockable)
  # In 2020, a code_studio_url indicates a lockable lesson in CSP.
  cb_lessons_nonlockable = cb_lessons.reject {|lesson| lesson['code_studio_url'].present?}
  unless lessons_nonlockable.count == cb_lessons_nonlockable.count
    raise "mismatched lesson counts for unit #{script.name} CS: #{lesson_names.count} CB: #{cb_lesson_names.count}"
  end
  mismatched_names = []
  lessons_nonlockable.each.with_index do |lesson, index|
    cb_lesson = cb_lessons[index]
    position = index + 1
    raise "unexpected position for lesson '#{lesson.name}'" unless lesson.relative_position == position
    raise "unexpected number for cb lesson '#{cb_lesson['title']}'" unless cb_lesson['number'] == position
    validated_lesson_pairs.push([lesson, cb_lesson])

    # The code studio lesson name should generally match the cb lesson title.
    # Warn if the names differ.
    #
    # Also look at the stage_name, which comes from code studio stage details
    # having been pulled through to CB. If the lesson name matches that name
    # exactly, then do not warn, because that's a strong signal that we found
    # the right lesson.
    unless [cb_lesson['stage_name'], cb_lesson['title']].any? {|name| name.strip.downcase == lesson.name.strip.downcase}
      mismatched_names.push([lesson.name, cb_lesson['title']])
    end
  end

  # Compare lockable lessons. Most lockable lessons won't have a lesson plan,
  # so just make sure we can find the corresponding code studio lesson for any
  # lesson plan belonging to a lockable lesson.
  cb_lessons_lockable = cb_lessons.select {|cb_lesson| cb_lesson['code_studio_url'].present?}
  cb_lessons_lockable.each do |cb_lesson|
    lockable_position = %r{/s/#{script.name}/lockable/(\d+)/}.match(cb_lesson['code_studio_url'])&.captures&.first
    unless lockable_position
      raise "could not parse code_studio_url: #{cb_lesson['code_studio_url']} for cb lesson '#{cb_lesson['title']}' in unit #{script.name}"
    end
    lesson = script.lessons.find_by!(lockable: true, relative_position: lockable_position)
    validated_lesson_pairs.push([lesson, cb_lesson])
    unless lesson.name.downcase.strip == cb_lesson['title'].downcase.strip
      mismatched_names.push([lesson.name, cb_lesson['title']])
    end
  end

  if mismatched_names.any?
    mismatch_summary = mismatched_names.map do |left, right|
      "  '#{left}' --> '#{right}'"
    end.join("\n")
    warn "WARNING: some lesson names differ for unit #{script.name}:\n#{mismatch_summary}"
  end

  validated_lesson_pairs
end

options = parse_options
raise "unit name is required. Use -h for options." unless options.unit_names.present?

require_rails_env
main(options)
