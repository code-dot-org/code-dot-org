class UpdateRelativePositionOfLessons < ActiveRecord::Migration[5.2]
  def up
    Script.all.each(&:fix_lesson_positions)
  end

  def down
  end
end
