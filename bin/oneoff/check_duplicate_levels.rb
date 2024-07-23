#!/usr/bin/env ruby

# For any Script or UnitGroup acting as a CourseVersion add a CourseOffering

require_relative '../../dashboard/config/environment'

unit_names = %w(csd3-2024 self-paced-pl-csp-2024 vpl-csp-2024 k5-onlinepd-2024 self-paced-pl-csa-2024 vpl-csa-2024 self-paced-pl-aiml-2024 self-paced-pl-microbit-2024 self-paced-pl-physical-computing-2024 self-paced-pl-csd-unit5-2024 self-paced-pl-csd-unit4-2024 self-paced-pl-csd-unit3-2024 self-paced-pl-csd-unit2-2024 self-paced-pl-csd-unit1-2024 self-paced-pl-csd-2024 vpl-csd-2024 virtual-pl-csd-summer-2024 pl-csd-summer-2024 music-tutorial-2024 elem-game-design-2024 k5-ai-data-2024 pre-express-2024 express-2024 coursef-2024 coursee-2024 coursed-2024 coursec-2024 courseb-2024 coursea-2024 csd7-2024 csd6b-2024 csd6a-2024 csd5-2024 csd4-2024 csd3-2024 csd2-2024 csd1-2024)

unit_names.each do |name|
  puts "processing #{name}"
  unitgp = UnitGroup.find_by_name(name)
  if unitgp.nil?
    ut = Unit.find_by_name(name)
    all_units = Array.new.push(ut)
  else
    all_units = unitgp.default_units
  end

  all_units.each do |unit|
    if unit.nil?
      puts "Unit is nil"
      next
    end

    lesson_gps = unit.lesson_groups
    if lesson_gps.nil?
      puts "Lesson group is nil"
      next
    end

    lessons = lesson_gps.map(&:lessons).flatten
    if lessons.nil?
      puts "Lessons is nil"
      next
    end

    lessons.each do |less|
      if less.levels.nil?
        puts "levels is nil"
        next
      end
      if less.levels.map(&:id).count != less.levels.map(&:id).uniq.count
        puts "potential duplicate in #{name} #{less.id} #{less.name}"
      end
    end
  end
end
