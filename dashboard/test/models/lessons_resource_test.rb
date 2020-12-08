require 'test_helper'

class LessonsResourceTest < ActiveSupport::TestCase
  test 'lesson and resource associations' do
    lesson = create :lesson
    resource = create :resource
    lesson.resources.push(resource)

    lesson_resource = lesson.lessons_resources.first
    assert_equal lesson, lesson_resource.lesson
    assert_equal resource, lesson_resource.resource
  end
end
