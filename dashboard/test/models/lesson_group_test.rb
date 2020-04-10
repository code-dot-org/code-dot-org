require 'test_helper'

class LessonGroupTest < ActiveSupport::TestCase
  test "can create a Lesson Group" do
    lesson_group = create :lesson_group, name: 'Test'
    assert_equal "Bogus Lesson Group #{lesson_group.name}", 'Bogus Lesson Group Test'
  end
end
