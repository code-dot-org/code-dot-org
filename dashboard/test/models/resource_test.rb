require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  test "can create resource" do
    resource = create :resource, key: 'my key'
    assert_equal 'my key', resource.key
  end

  test "resource can belong to lessons" do
    resource = create :resource, key: 'my key'
    lesson1 = create :lesson, resources: [resource]
    lesson2 = create :lesson, resources: [resource]
    assert_equal [lesson1, lesson2], resource.lessons
  end
end
