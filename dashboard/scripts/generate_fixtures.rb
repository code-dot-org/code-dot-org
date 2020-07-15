#!/usr/bin/env ruby

require_relative '../config/environment'

scripts_map = {
  'hour_of_code' => 'Hour of Code',
  'edit-code' => 'edit-code',
  'events' => 'events',
  'jigsaw' => 'jigsaw',
  'hourofcode' => 'hourofcode',
  'starwars' => 'starwars',
  'starwarsblocks' => 'starwarsblocks',
  'mc' => 'mc',
  'minecraft' => 'minecraft',
  'hero' => 'hero',
  'aquatic' => 'aquatic',
  'dance' => 'dance',
  'frozen' => 'frozen',
  'playlab' => 'playlab',
  'infinity' => 'infinity',
  'artist' => 'artist',
  'algebra' => 'algebra',
  'algebraPD' => 'algebraPD',
  'flappy' => 'flappy',
  '20-hour' => '20-hour',
  'course1' => 'course1',
  'course2' => 'course2',
  'course3' => 'course3',
  'course4' => 'course4',
  'cspunit1' => 'cspunit1',
  'cspunit2' => 'cspunit2',
  'cspunit3' => 'cspunit3',
  'cspunit4' => 'cspunit4',
  'cspunit5' => 'cspunit5',
  'cspunit6' => 'cspunit6',
  'ECSPD' => 'ECSPD',
  'ECSPD-NexTech' => 'ECSPD-NexTech',
  'allthethings' => 'allthethings',
  'coursea-2017' => 'coursea-2017',
  'courseb-2017' => 'courseb-2017',
  'coursec-2017' => 'coursec-2017',
  'coursed-2017' => 'coursed-2017',
  'coursee-2017' => 'coursee-2017',
  'coursef-2017' => 'coursef-2017',
  'express-2017' => 'express-2017',
  'pre-express-2017' => 'pre-express-2017'
}

@scripts = {}
@lesson_groups = {}
@lessons = {}
@script_levels = {}
@levels = {}
@level_concept_difficulty = {}
@level_sources = {}
@callouts = {}

def handle_level(level)
  attributes = level.attributes.clone
  attributes.delete('id')
  @levels["level_#{level.id}"] = attributes

  if level.level_concept_difficulty
    lcd_attributes = level.level_concept_difficulty.attributes
    lcd_attributes.delete('level_id')
    lcd_attributes = lcd_attributes.merge({"level" => "level_#{level.id}"})
    @level_concept_difficulty["level_concept_difficulty_#{level.id}"] = lcd_attributes
  end

  level_source = level.level_sources.first
  if level_source
    ls_attributes = level_source.attributes
    ls_attributes.delete('level_id')
    ls_attributes = ls_attributes.merge({"level" => "level_#{level.id}"})
    @level_sources["level_source_#{level.id}"] = ls_attributes
  end
end

scripts_map.each do |_script_id, name|
  puts name
  script = Script.find_by_name name
  @scripts[name] = script.attributes

  script.lesson_groups.each do |lesson_group|
    @lesson_groups["lesson_group_#{lesson_group.id}"] = lesson_group.attributes
  end

  script.lessons.each do |lesson|
    @lessons["lesson_#{lesson.id}"] = lesson.attributes
  end

  script.script_levels.to_a[0, 10000].each do |sl|
    key = "script_level_#{sl.script_id}_#{sl.level_id}"
    @script_levels[key] = sl.attributes.merge({"levels" => "level_#{sl.level_id}"})

    sl.callouts.each do |c|
      @callouts["callout_#{c.id}"] = c.attributes
    end
    handle_level(sl.level)
  end
end

ProjectsController::STANDALONE_PROJECTS.each do |_k, v|
  handle_level(Level.find_by_name(v['name']))
end

def yamlize(hsh)
  hsh.each do |_k, v|
    if v.key? "properties"
      v['properties'] = v['properties'].to_json
    end
  end
  return hsh.to_yaml[4..-1]
end

prefix = "../test/fixtures/"

File.new("#{prefix}script.yml", 'w').write(yamlize(@scripts))
File.new("#{prefix}lesson_group.yml", 'w').write(yamlize(@lesson_groups))
File.new("#{prefix}lesson.yml", 'w').write(yamlize(@lessons))
File.new("#{prefix}script_level.yml", 'w').write(yamlize(@script_levels))
File.new("#{prefix}level.yml", 'w').write(yamlize(@levels))
File.new("#{prefix}level_concept_difficulty.yml", 'w').write(yamlize(@level_concept_difficulty))
File.new("#{prefix}level_source.yml", 'w').write(yamlize(@level_sources))
File.new("#{prefix}callout.yml", 'w').write(yamlize(@callouts))
