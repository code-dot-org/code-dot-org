require 'test_helper'

class LessonActivityTest < ActiveSupport::TestCase
  test "lesson can contain activities" do
    lesson = create :lesson
    activity1 = create :lesson_activity, lesson: lesson
    activity2 = create :lesson_activity, lesson: lesson
    assert_equal [activity1, activity2], lesson.lesson_activities
  end
end
