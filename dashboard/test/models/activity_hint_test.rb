require 'test_helper'

class ActivityHintTest < ActiveSupport::TestCase
  test "nothing bad happens if hint_visibility null" do
    activity_hint = create :activity_hint
    activity_hint.set_made_visible
    assert_nil activity_hint.hint_visibility
  end

  test "hint visibility gets updated once" do
    activity_hint = create(:activity_hint, hint_visibility: 1)
    assert !activity_hint.made_visible?
    activity_hint.set_made_visible
    assert activity_hint.made_visible?
    value = activity_hint.hint_visibility
    activity_hint.set_made_visible
    assert activity_hint.made_visible?
    assert_equal value, activity_hint.hint_visibility
  end
end
