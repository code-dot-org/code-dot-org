# Seed the named courses, their units, and only the levels those units use,
# into the current database. Run from dashboard/ after `rake seed:ui_test`:
#
#   bin/rails runner ../.oss-scanner/seed-units.rb computing-foundations-for-a-digital-age-2027
#
# Same order as `rake seed:default`: course offering, levels, units, course.
# The full `seed:custom_levels` loads every level in the repository, which
# takes far longer than the scanner's build allows.

require 'set'

Rails.application.load_tasks # defines parse_dsl_files and update_scripts

abort 'usage: seed-units.rb COURSE_NAME...' if ARGV.empty?
course_paths = ARGV.map do |name|
  path = UnitGroup.file_path(name)
  File.exist?(path) ? path : abort("no such course: #{path}")
end
courses = course_paths.map {|path| JSON.parse(File.read(path))}
units = courses.flat_map {|c| c['script_names']}.uniq
script_files = units.map {|name| "config/scripts_json/#{name}.script_json"}

custom = Dir.glob('config/levels/**/*.level').to_h {|path| [File.basename(path, '.level'), path]}
child_types = %w(TextMatch ContractMatch External Match Multi EvaluationMulti)
parent_types = %w(BubbleChoice LevelGroup)
dsl = {}
(child_types + parent_types).each do |type|
  Dir.glob("config/scripts/**/*.#{type.underscore}*").each do |path|
    name = File.read(path)[/^name\s+['"](.+?)['"]/, 1]
    dsl[name] = [path, type] if name
  end
end
known = custom.keys.to_set | dsl.keys.to_set

# A level names its children (sublevels, contained levels, templates) in its
# file. Follow every quoted string that is the name of another level.
wanted = Set.new
queue = script_files.flat_map do |path|
  JSON.parse(File.read(path))['levels_script_levels'].map {|sl| sl['seeding_key']['level.key']}
end
until queue.empty?
  name = queue.shift
  next if wanted.include?(name)
  path = custom[name] || dsl.dig(name, 0)
  next unless path
  wanted << name
  File.read(path).scan(/["']([^"'\n]{3,200})["']/).flatten.each do |s|
    queue << s if known.include?(s) && !wanted.include?(s)
  end
end

pick = ->(types) {wanted.filter_map {|n| dsl[n][0] if dsl[n] && types.include?(dsl[n][1])}.sort}
child_dsls = pick.call(child_types)
parent_dsls = pick.call(parent_types)
custom_paths = wanted.filter_map {|n| custom[n]}.sort

puts "seed-units: #{units.size} units, #{wanted.size} levels " \
  "(#{child_dsls.size} child DSL, #{custom_paths.size} custom, #{parent_dsls.size} parent DSL)"

courses.each do |c|
  offering = CourseOffering.file_path(c['properties']['family_name'])
  CourseOffering.seed_record(offering) if File.exist?(offering)
end
DSLDefined.transaction {parse_dsl_files(child_dsls, child_types)} if child_dsls.any?
custom_paths.each {|path| LevelLoader.import_levels(path.gsub(/[\[\]{}*?,\\]/) {|c| "\\#{c}"})}
DSLDefined.transaction {parse_dsl_files(parent_dsls, parent_types)} if parent_dsls.any?
update_scripts(script_files: script_files)
course_paths.each {|path| UnitGroup.load_from_path(path)}
# Vocabulary and resources need the course version, which exists only now.
update_scripts(script_files: script_files)

ARGV.each do |name|
  course = UnitGroup.find_by!(name: name)
  puts "seed-units: #{name}: " +
    course.default_units.map {|u| "#{u.name} (#{u.lessons.count} lessons, #{u.script_levels.count} levels)"}.join(', ')
end
