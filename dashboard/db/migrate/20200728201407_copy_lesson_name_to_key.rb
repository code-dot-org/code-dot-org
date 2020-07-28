class CopyLessonNameToKey < ActiveRecord::Migration[5.0]
  def up
    Lesson.all.each do |lesson|
      lesson.key = lesson.name
      lesson.save!
    end
  end

  def down
  end
end
