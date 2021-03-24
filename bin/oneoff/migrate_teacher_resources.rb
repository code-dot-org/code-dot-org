#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

KEYS_TO_NAMES = {
  "curriculum" => 'Curriculum',
  "teacherForum" => 'Teacher Forum',
  "professionalLearning" => 'Professional Learning',
  "lessonPlans" => 'Lesson Plans',
  "vocabulary" => 'Vocabulary',
  "codeIntroduced" => 'Code Introduced',
  "standardMappings" => 'Standard Mappings',
  "allHandouts" => 'All Handouts',
  "videos" => 'Videos',
  "curriculumGuide" => 'Curriculum Guide'
}

Script.all.select(&:is_migrated).each do |script|
  next if script.teacher_resources.blank?
  course_version = script.get_course_version
  next unless course_version
  script.resources = script.teacher_resources.map do |tr|
    name = KEYS_TO_NAMES[tr[0]] || tr[0]
    resource = Resource.find_or_create_by(name: name, url: tr[1], course_version_id: course_version.id)
    resource
  end
  script.teacher_resources = []
  script.write_script_dsl
  script.write_script_json
  puts "Migrated teacher resourcres for #{script.name}"
end
