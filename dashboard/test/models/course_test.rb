require 'test_helper'

class CourseTest < ActiveSupport::TestCase
  test "should allow valid course names" do
    create(:course, name: 'valid-name')
  end

  test "should not allow uppercase letters in course name" do
    assert_raises ActiveRecord::RecordInvalid do
      create(:course, name: 'UpperCase')
    end
  end

  test "should not allow spaces in course name" do
    assert_raises ActiveRecord::RecordInvalid do
      create(:course, name: 'spaced out')
    end
  end

  test "should allow uppercase letters if it is a plc course" do
    course = Course.new(name: 'PLC Course')
    course.plc_course = Plc::Course.new(course: course)
    course.save!
  end
end
