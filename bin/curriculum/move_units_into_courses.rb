#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'

standalone_scripts = Script.all.select(&:is_course?).reject {|s| s.name == 'fit2019-apprentice'}
ActiveRecord::Base.transaction do
  standalone_scripts.each do |s|
    puts "Moving #{s.name} into a unit group"
    unit_group = UnitGroup.create!(name: s.name, published_state: s.published_state)
    #UnitGroupUnit.create!(unit_group: unit_group, script: s, position: 1)
    course_version = s.course_version
    course_version.content_root = unit_group
    course_version.save!
    unit_group.family_name = s.family_name
    unit_group.version_year = s.version_year
    unit_group.save!
    unit_group.persist_strings_and_units_changes([s.name], [], {title: s.title_for_display})
  end
end
