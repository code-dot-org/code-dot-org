require 'test_helper'

class ActivitySectionTest < ActiveSupport::TestCase
  test "activities can contain activity sections" do
    lesson_activity = create :lesson_activity
    activity_section1 = create :activity_section, lesson_activity: lesson_activity
    activity_section2 = create :activity_section, lesson_activity: lesson_activity
    assert_equal [activity_section1, activity_section2], lesson_activity.activity_sections
  end
end
