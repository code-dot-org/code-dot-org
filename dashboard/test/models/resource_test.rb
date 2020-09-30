require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  test "can create resource" do
    resource = create :resource, key: 'my key'
    assert_equal 'my key', resource.key
  end

  test "resource can be in multiple lessons" do
    resource = create :resource
    lesson1 = create :lesson, resources: [resource]
    lesson2 = create :lesson, resources: [resource]
    assert_equal [lesson1, lesson2], resource.lessons
  end

  test "multiple resources can be in a lesson" do
    lesson = create :lesson
    resource1 = create :resource, lessons: [lesson]
    resource2 = create :resource, lessons: [lesson]
    assert_equal [resource1, resource2], lesson.resources
  end
end
