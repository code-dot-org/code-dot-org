#!/usr/bin/env ruby

# Migrate levels that use a contained level for their "predict" step over to the
# Lab2 predict_settings model.
#
# In the legacy model, a level points at a contained level (via
# contained_level_names) which is either a FreeResponse or a Multi (multiple
# choice) level. The contained level supplies the question. In the Lab2 model
# the question lives directly on the level in predict_settings + long_instructions.
#
# For each level processed:
#   - a FreeResponse contained level  -> questionType "freeResponse"
#   - a Multi contained level         -> questionType "multipleChoice"
#   - long_instructions is set to the contained level's question text. Any
#     existing instructions are discarded: when a level has a contained level
#     its own instructions are never shown, so they are throwaway.
#   - teacher_markdown from the contained level, if any, is appended to the
#     parent level's existing teacher_markdown.
#   - contained_level_names is left in place.
#
# Changes are applied via Level#save!, so after_save callbacks run and the
# updated .level file is rewritten by LevelFiles.write_custom_level_file.
#
# Usage:
#   bin/oneoff/migrate_contained_levels_to_predict.rb --level "CSA U1L2-L3_2022"
#   bin/oneoff/migrate_contained_levels_to_predict.rb --folder dashboard/config/levels/custom/javalab
#   bin/oneoff/migrate_contained_levels_to_predict.rb --folder <dir> --dry-run
#
# --level may be a level name or a path to a .level file, and may be repeated.
# --folder processes every .level file in the directory, and may be repeated.
# --dry-run prints what would change without saving.

require_relative '../../dashboard/config/environment'
require 'optparse'

# Matches PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT in apps/src/lab2/constants.ts.
PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT = 50

options = {levels: [], folders: [], dry_run: false}
OptionParser.new do |opts|
  opts.banner = 'Usage: migrate_contained_levels_to_predict.rb [options] [level names...]'
  opts.on('--level NAME_OR_PATH', 'A level name or .level file path. May be repeated.') do |v|
    options[:levels] << v
  end
  opts.on('--folder DIR', 'Process every .level file in DIR. May be repeated.') do |v|
    options[:folders] << v
  end
  opts.on('-n', '--dry-run', 'Print planned changes without saving.') do
    options[:dry_run] = true
  end
  opts.on('-h', '--help') do
    puts opts
    exit
  end
end.parse!

# Bare arguments are treated as level names/paths too.
options[:levels].concat(ARGV)

# Resolve a level name from either a name or a .level file path. Custom level
# files are named after the level, so the basename is the name.
def level_name_from_token(token)
  if token.end_with?('.level') || token.include?('/')
    File.basename(token, '.level')
  else
    token
  end
end

# Collect the level names to process, preserving order and removing duplicates.
names = []
options[:levels].each {|token| names << level_name_from_token(token)}
options[:folders].each do |folder|
  unless File.directory?(folder)
    warn "skipping --folder #{folder}: not a directory"
    next
  end
  Dir.glob(File.join(folder, '*.level')).sort.each do |path|
    names << File.basename(path, '.level')
  end
end
names.uniq!

if names.empty?
  warn 'nothing to do: pass --level, --folder, or level names'
  exit 1
end

# Build the predict_settings hash and question text for a contained level.
# Returns [predict_settings, question_body, warnings] or nil if the contained
# level is not a type we know how to migrate. question_body is the raw question
# text without the title prepended; the caller adds the title and decides what
# to do when the body is blank.
def build_predict(contained)
  warnings = []
  if contained.is_a?(FreeResponse)
    height = contained.properties['height'].presence&.to_i || PREDICT_FREE_RESPONSE_DEFAULT_HEIGHT
    settings = {
      'isPredictLevel' => true,
      'questionType' => 'freeResponse',
      'solution' => '',
      'codeEditableAfterSubmit' => false,
      'placeholderText' => contained.properties['placeholder'].to_s,
      'freeResponseHeight' => height,
    }
    [settings, contained.properties['long_instructions'], warnings]
  elsif contained.is_a?(Multi)
    answers = contained.properties['answers'] || []
    option_texts = answers.map {|a| a['text']}
    correct = answers.select {|a| a['correct']}.map {|a| a['text']}
    # The Lab2 editor stores the solution as a comma-joined list of the correct
    # option texts and matches them back by splitting on ",". An option text that
    # itself contains a comma would therefore round-trip incorrectly.
    option_texts.each {|o| warnings << "option text contains a comma: #{o.inspect}" if o.to_s.include?(',')}
    warnings << 'no correct answer marked on the contained Multi' if correct.empty?
    settings = {
      'isPredictLevel' => true,
      'questionType' => 'multipleChoice',
      'solution' => correct.join(','),
      'codeEditableAfterSubmit' => false,
      'multipleChoiceOptions' => option_texts,
      'isMultiSelect' => correct.length > 1,
    }
    [settings, contained.get_question_text, warnings]
  end
end

# Prepend the contained level's title as an h1 to its question text, when present.
def with_title(contained, body)
  title = contained.properties['title'].to_s.strip
  body = body.to_s
  title.empty? ? body : "# #{title}\n\n#{body}"
end

def truncate(str, len = 80)
  str = str.to_s.tr("\n", ' ')
  str.length > len ? "#{str[0, len]}..." : str
end

# The level's created_at is written into the .level file by to_xml, but a locally
# seeded database stamps every row with the seed time rather than the value from
# the file. Read the original value back from the file so save! doesn't churn it.
def file_created_at(level)
  path = Policies::LevelFiles.level_file_path(level)
  return nil unless File.exist?(path)
  cdata = File.read(path).match(/<!\[CDATA\[(.*)\]\]>/m)
  return nil unless cdata
  JSON.parse(cdata[1])['created_at']
rescue StandardError
  nil
end

counts = {migrated: 0, skipped: 0, errors: 0}

names.each do |name|
  level = Level.find_by(name: name)
  unless level
    warn "SKIP  #{name}: no such level in the database"
    counts[:skipped] += 1
    next
  end

  contained_names = level.try(:contained_level_names) || level.properties['contained_level_names']
  if contained_names.blank?
    warn "SKIP  #{name}: no contained level"
    counts[:skipped] += 1
    next
  end
  # Some levels list the same contained name more than once; collapse exact
  # duplicates. More than one *distinct* contained level is ambiguous, so skip.
  contained_names = contained_names.uniq
  if contained_names.length > 1
    warn "SKIP  #{name}: #{contained_names.length} distinct contained levels (expected 1): #{contained_names.inspect}"
    counts[:skipped] += 1
    next
  end

  if level.properties.dig('predict_settings', 'isPredictLevel')
    warn "SKIP  #{name}: already has predict_settings"
    counts[:skipped] += 1
    next
  end

  contained = Level.find_by(name: contained_names.first)
  unless contained
    warn "SKIP  #{name}: contained level #{contained_names.first.inspect} not found"
    counts[:skipped] += 1
    next
  end

  result = build_predict(contained)
  unless result
    warn "SKIP  #{name}: contained level is a #{contained.class} (not FreeResponse or Multi)"
    counts[:skipped] += 1
    next
  end
  settings, question_body, warnings = result
  warnings.each {|w| warn "WARN  #{name}: #{w}"}

  # Skip only when there is no text at all to show. A title alone is an
  # acceptable question, so check the assembled instructions (title + body)
  # rather than the body, and skip the level when even that is empty.
  instructions = with_title(contained, question_body)
  if instructions.blank?
    warn "SKIP  #{name}: contained level #{contained.name} has no question text"
    counts[:skipped] += 1
    next
  end

  # Append the contained level's teacher_markdown to the parent's, when present.
  # Both pieces are kept; a blank-line separator is inserted between them so
  # they don't run together.
  contained_teacher_markdown = contained.properties['teacher_markdown'].to_s
  existing_teacher_markdown = level.properties['teacher_markdown'].to_s
  teacher_markdown =
    if contained_teacher_markdown.blank?
      existing_teacher_markdown
    elsif existing_teacher_markdown.blank?
      contained_teacher_markdown
    else
      "#{existing_teacher_markdown}\n\n#{contained_teacher_markdown}"
    end

  puts "MIGRATE #{name}"
  puts "  contained: #{contained.name} (#{contained.class})"
  puts "  questionType: #{settings['questionType']}"
  puts "  instructions: #{truncate(instructions)}"
  if settings['questionType'] == 'multipleChoice'
    puts "  options: #{settings['multipleChoiceOptions'].inspect}"
    puts "  solution: #{settings['solution'].inspect}#{settings['isMultiSelect'] ? ' (multi-select)' : ''}"
  else
    puts "  placeholder: #{settings['placeholderText'].inspect}, height: #{settings['freeResponseHeight']}"
  end
  puts "  teacher_markdown: #{truncate(teacher_markdown)}" if contained_teacher_markdown.present?

  warn "WARN  #{name}: not published; .level file will not be rewritten" unless level.published

  if options[:dry_run]
    counts[:migrated] += 1
    next
  end

  begin
    level.predict_settings = settings
    level.properties['long_instructions'] = instructions
    level.properties['teacher_markdown'] = teacher_markdown if teacher_markdown.present?
    original_created_at = file_created_at(level)
    level.created_at = original_created_at if original_created_at
    level.save!
    counts[:migrated] += 1
  rescue => exception
    warn "ERROR #{name}: #{exception.class}: #{exception.message}"
    counts[:errors] += 1
  end
end

puts
puts "#{options[:dry_run] ? '[DRY RUN] ' : ''}migrated: #{counts[:migrated]}, skipped: #{counts[:skipped]}, errors: #{counts[:errors]}"
