require 'test_helper'

class UserHelpersTest < ActiveSupport::TestCase

  test 'UserHelpers.sponsor_message' do
    teacher = create :teacher

    assert_equal "Someone made the generous gift to sponsor your classroom's learning. Pay it forward, <a href=\"http://code.org/donate\">donate $25 to Code.org</a> to pay for another classroom's education.",
      UserHelpers.sponsor_message(teacher)

    student = create :student
    assert_equal "Someone made the generous gift to sponsor your learning. A generous <a href=\"http://code.org/donate\">gift of $1 to Code.org</a> will help another student learn.",
      UserHelpers.sponsor_message(student)
  end
end
