class CopyLessonNameToKeyTake2 < ActiveRecord::Migration[5.0]
  # We are doing this a second time because new lessons were created between the time the last
  # one was run and when we figured out there was another change we need to make to make
  # sure new lessons got their key value set.
  def up
    Lesson.all.each do |lesson|
      lesson.key = lesson.name
      lesson.save!
    end
  end

  def down
  end
end
