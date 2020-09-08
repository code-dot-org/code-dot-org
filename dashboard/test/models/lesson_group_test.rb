require 'test_helper'

class LessonGroupTest < ActiveSupport::TestCase
  test "can create a Lesson Group" do
    lesson_group = create :lesson_group, key: 'Test'
    assert_equal "Bogus Lesson Group #{lesson_group.key}", 'Bogus Lesson Group Test'
  end
  test "lessons ordered correctly" do
    script = create :script
    lesson_group = create :lesson_group
    create :lesson, name: "Lesson3", script: script, lesson_group: lesson_group, absolute_position: 3
    create :lesson, name: "Lesson2", script: script, lesson_group: lesson_group, absolute_position: 2
    create :lesson, name: "Lesson1", script: script, lesson_group: lesson_group, absolute_position: 1

    assert_equal ["Lesson1", "Lesson2", "Lesson3"], lesson_group.lessons.collect(&:name)
  end

  test 'should summarize lesson group' do
    script = create :script
    lesson_group = create :lesson_group, key: 'my-lesson-group', user_facing: true, position: 1, script: script

    summary = lesson_group.summarize
    assert_equal 'my-lesson-group', summary[:key]
  end

  test 'should summarize lesson groups for edit' do
    script = create :script
    lesson_group = create :lesson_group, key: 'my-lesson-group', user_facing: true, position: 1, script: script
    lesson = create :lesson, name: "Lesson1", script: script, lesson_group: lesson_group, absolute_position: 1
    create(:script_level, script: script, lesson: lesson)

    summary = lesson_group.summarize_for_edit

    assert_equal 'my-lesson-group', summary[:key]
    assert_equal 1, summary[:position]
    assert_equal true, summary[:user_facing]
  end
end
