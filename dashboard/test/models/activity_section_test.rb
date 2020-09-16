require 'test_helper'

class ActivitySectionTest < ActiveSupport::TestCase
  test "activities can contain sections" do
    activity = create :lesson_activity
    section1 = create :activity_section, activity: activity
    section2 = create :activity_section, activity: activity
    assert_equal [section1, section2], activity.sections
  end
end
