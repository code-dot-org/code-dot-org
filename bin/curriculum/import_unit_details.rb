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

        Example: #{0} -u coursea-2021 -m LessonGroup,Lesson,Activity,Resource,Objective,Vocabulary,ProgrammingExpression,Standard
        Example: #{0} -l -u csd1-2021 -m Activity,Resource,Objective
        Example: #{0} -l -u csp2-2021,csp3-2021,csp4-2021 -m Lesson
      BANNER

      opts.separator ""

      opts.on('-l', '--local', 'Use local curriculum builder running on localhost:8000.') do
        options.local = true
      end

      opts.on('-u', '--unit_names UnitName1,UnitName2', Array, 'Unit names to import') do |unit_names|
        options.unit_names = unit_names
      end

      opts.on('-m', '--models Resource,Vocabulary,ProgrammingExpression', Array, 'Models to import: LessonGroup, Lesson, Activity, Resource, Objective, ProgrammingExpression, Standard or Vocabulary') do |models|
        options.models = models
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
  raise "Must specify models to import" if options.models.blank?

  cb_url_prefix = options.local ? 'http://localhost:8000' : 'http://www.codecurricula.com'

  options.unit_names.each do |unit_name|
    script = Script.find_by_name!(unit_name)
    log "found code studio script name #{script.name} with id #{script.id}"

    raise "Only hidden scripts can be imported" unless script.hidden

    # If a path is not found, curriculum builder returns a 302 redirect the same
    # path with the /en-us prefix, which then returns 404. to make error
    # handling a bit easier, just include the /en-us prefix so that we get a 404
    # on the first try if the script cannot be found.
    url = "#{cb_url_prefix}/en-us/export/unit/#{unit_name}.json?format=json"
    cb_unit_json = fetch(url)

    cb_unit = JSON.parse(cb_unit_json)
    validate_unit(script, cb_unit)
    lesson_pairs = get_validated_lesson_pairs(script, cb_unit)
    lesson_group_pairs = get_lesson_group_pairs(script, cb_unit['chapters'], lesson_pairs)

    log "validated #{lesson_pairs.count} lessons and #{lesson_group_pairs.count} lesson groups in unit #{script.name}"

    next if options.dry_run

    lesson_pairs.each do |lesson, cb_lesson|
      LessonImportHelper.update_lesson(lesson, options.models, cb_lesson)
      log("update lesson #{lesson.id} with cb lesson data: #{cb_lesson.to_json[0, 50]}...")
    end

    paired_lesson_ids = lesson_pairs.map {|lesson, _| lesson.id}
    lessons_without_lesson_plan_to_update = script.lessons.select {|l| !l.has_lesson_plan?}.reject {|l| paired_lesson_ids.include?(l.id)}
    lessons_without_lesson_plan_to_update.each do |no_lesson_plan|
      LessonImportHelper.update_lesson(no_lesson_plan, options.models)
    end

    updated_lesson_group_count = lesson_group_pairs.count do |lesson_group, cb_chapter|
      # Make sure the lesson group update does not also try to update lessons.
      cb_chapter = cb_chapter.reject {|k, _| k == 'lessons'}

      # Use a heuristic to make sure we do not import CSF chapter descriptions
      # which are equal to the chapter title.
      cb_chapter['description'] = nil if cb_chapter['description'] == cb_chapter['title']
      lesson_group.update_from_curriculum_builder(cb_chapter) if options.models.include?('LessonGroup')
    end

    script.update!(show_calendar: !!cb_unit['show_calendar'], is_migrated: true)
    script.fix_script_level_positions
    script.write_script_dsl
    script.write_script_json

    puts "updated #{updated_lesson_group_count} lesson groups in unit #{script.name}"
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

# Retrieves all lessons from the CB unit, which could either be in the lessons
# field or nested within various chapters.
# @param [Hash] cb_unit - Curriculum Builder Unit
# @return [Array.<Hash>] - Array of CB Lessons
def get_cb_lessons(cb_unit)
  # In 2020 on Curriculum Builder, CSF and CSD lessons are all inside chapters,
  # and CSP does not use chapters. Therefore, we can simplify the merge logic by
  # assuming that lessons are all inside chapters when chapters are present.
  if cb_unit['chapters'].present? && cb_unit['lessons'].present?
    raise "found #{cb_unit['lessons'].count} unexpected lessons outside of chapters"
  end

  if cb_unit['chapters'].blank? && cb_unit['lessons'].blank?
    raise "no chapters or lessons found"
  end

  cb_unit['lessons'].presence || cb_unit['chapters'].map {|ch| ch['lessons']}.flatten
end

# Because not all lessons in code studio have lesson plans in
# Curriculum Builder, there may be a mismatch between the number of lessons in
# CB and Code Studio. This method does the following:
# 1. Verifies that every lesson with lesson plan in Code Studio has a lesson plan in CB.
# 2. Verifies that every lesson plan in CB has a corresponding lesson in Code Studio
# 3. Returns a list of pairs of all Code Studio Lessons with corresponding
#    CB lesson data to update them with.
#
# @param [Script] script - Code Studio Script/Unit object.
# @param [Hash] - Curriculum Builder Unit
# @return [Array<Array.<Lesson, Hash>>] - Array of pairs of Code Studio Lesson
#   objects and CB lesson data objects.
def get_validated_lesson_pairs(script, cb_unit)
  validated_lesson_pairs = []

  cb_lessons = get_cb_lessons(cb_unit)

  # Compare lessons with lesson plans from CB and Code Studio.
  lessons_with_lesson_plans = script.lessons.reject {|l| !l.has_lesson_plan?}
  unless lessons_with_lesson_plans.count == cb_lessons.count
    raise "mismatched lesson counts for unit #{script.name} CS: #{lessons_with_lesson_plans.count} CB: #{cb_lessons.count}"
  end
  mismatched_names = []
  lessons_with_lesson_plans.each.with_index do |lesson, index|
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
    unless [cb_lesson['stage_name'], cb_lesson['title']].any? {|name| canonicalize(name) == canonicalize(lesson.name)}
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

# Given a Code Studio Script/Unit:
#
# 1. Filter out any LessonGroups which do not contain any lessons with
# corresponding lessons in CB, because these LessonGroups should not have
# corresponding chapters on CB.
# 2. verify that there is now a 1-to-1 correspondence between the remaining
# LessonGroups and CB chapters.
# 3. For each remaining LessonGroup, filter out any Lessons which do not have
# corresponding lessons in CB.
# 4. For each remaining LessonGroup, verify that the remaining number of lessons
# is the same as the number of lessons in the corresponding CB chapter. We
# already did more detailed checks to pair up lessons between CB and Code Studio,
# so this is just a heuristic to confirm these lessons are distributed similarly.
# 5. Warn if any lesson group names differ from the corresponding CB chapter name.
# 6. Return a list of pairs of LessonGroups and CB chapters.
#
# @param [Script] script - Code Studio Script/Unit object.
# @param [Array<Hash>] - Array of CB chapters
# @param [Array<Array.<Lesson, Hash>>] - Array of pairs of Code Studio Lesson
#   objects and CB lessons.
# @return [Array<Array<LessonGroup, Hash>>] lesson_group_pairs - Array of pairs
#   of Code Studio LessonGroup objects and CB chapters.
def get_lesson_group_pairs(script, cb_chapters, lesson_pairs)
  return [] unless cb_chapters.present?

  # Compute a list of code studio lessons which have corresponding lessons in CB.
  paired_lessons = lesson_pairs.map(&:first)

  # 1. Filter out any LessonGroups which do not contain any lessons with
  # corresponding lessons in CB.
  filtered_lesson_groups = script.lesson_groups.all.select do |lg|
    lg.lessons.any? {|lesson| paired_lessons.include?(lesson)}
  end

  # 2. verify a 1-to-1 correspondence between remaining LessonGroups and CB chapters.
  unless filtered_lesson_groups.count == cb_chapters.count
    raise "unexpected chapter count for unit #{script.name}: #{filtered_lesson_groups.count} != #{cb_chapters.count}."
  end

  lesson_group_pairs = []
  mismatched_names = []
  filtered_lesson_groups.each.with_index do |lesson_group, index|
    # 3. Filter out any Lessons which do not have corresponding lessons in CB.
    filtered_lessons = lesson_group.lessons.all.select {|lesson| paired_lessons.include?(lesson)}
    cb_chapter = cb_chapters[index]

    # 4. Verify that the remaining number of lessons is now the same as the
    # number of lessons in the corresponding CB chapter.
    unless filtered_lessons.count == cb_chapter['lessons'].count
      raise "lesson count mismatch for lesson group #{lesson_group.display_name}: "\
              "#{filtered_lessons.count} != #{cb_chapter['lessons'].count}"
    end

    lesson_group_pairs.push([lesson_group, cb_chapter])
    unless canonicalize(lesson_group.display_name) == canonicalize(cb_chapter['title'])
      mismatched_names.push([lesson_group.display_name, cb_chapter['title']])
    end
  end

  # 5. warn if any lesson group names differ from the corresponding CB chapter name.
  if mismatched_names.any?
    mismatch_summary = mismatched_names.map do |left, right|
      "  '#{left}' --> '#{right}'"
    end.join("\n")
    warn "WARNING: some lesson group names differ for unit #{script.name}:\n#{mismatch_summary}"
  end

  # 6. return a list of pairs of LessonGroups and CB chapters.
  lesson_group_pairs
end

# Canonicalize a lesson name or lesson group name to increase the chances of a
# match when names are compared across CB and Code Studio.
# * ignores prefixes like "Lesson 1: " or "Chapter 12: "
# * ignores - and : characters
# * ignores differences in case and whitespace
def canonicalize(str)
  match = /^(Lesson|Chapter) \d+: (.*)/.match(str)
  str = match&.captures&.last if match
  str.gsub!(/[-:]/, ' ')
  # deduplicate spaces
  str = str.split(' ').compact.join(' ')
  str.downcase.strip
end

options = parse_options
raise "unit name is required. Use -h for options." unless options.unit_names.present?

require_rails_env
main(options)
