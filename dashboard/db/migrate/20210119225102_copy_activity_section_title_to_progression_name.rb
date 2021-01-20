class CopyActivitySectionTitleToProgressionName < ActiveRecord::Migration[5.2]
  def up
    Script.where("properties -> '$.is_migrated' = ?", true).each do |script|
      script.lessons.each do |lesson|
        lesson.lesson_activities.each do |activity|
          activity.activity_sections.each do |section|
            next if section.script_levels.empty?
            section.progression_name = section.name
            section.save!
            section.script_levels.each do |sl|
              sl.progression = section.name
              sl.save!
            end
          end
        end
      end
    end
  end

  def down
  end
end
