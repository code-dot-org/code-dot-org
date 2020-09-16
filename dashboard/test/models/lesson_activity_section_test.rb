require 'test_helper'

class LessonActivitySectionTest < ActiveSupport::TestCase
  test "activities can contain sections" do
    activity = create :lesson_activity
    section1 = create :lesson_activity_section, lesson_activity: activity
    section2 = create :lesson_activity_section, lesson_activity: activity
    assert_equal [section1, section2], activity.lesson_activity_sections
  end
end
