require 'test_helper'

class ActivitySectionTest < ActiveSupport::TestCase
  test "activities can contain activity sections" do
    activity = create :lesson_activity
    activity_section1 = create :activity_section, activity: activity
    activity_section2 = create :activity_section, activity: activity
    assert_equal [activity_section1, activity_section2], activity.activity_sections
  end
end
