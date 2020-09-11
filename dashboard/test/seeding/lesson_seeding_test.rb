require 'test_helper'

class LessonSeedingTest < ActiveSupport::TestCase
  test 'serialize script lessons' do
    script = create_script_with_lessons(num_lesson_groups: 2, num_lessons_per_group: 2)
    # Set names / keys for consistent results regardless of DB state
    script.name = 'bogus-script-1'
    script.lesson_groups.each_with_index do |lg, i|
      lg.key = "Bogus Lesson Group #{i + 1}"
      lg.save!
    end
    script.lessons.each_with_index do |l, i|
      l.key = "Bogus-Lesson-#{i + 1}"
      l.save!
    end

    # Set some properties to serialize
    lesson1, lesson2, lesson3, _ = script.lesson_groups.map(&:lessons).flatten
    lesson1.overview = 'overview 1'
    lesson2.visible_after = 'visible_after 2'
    lesson3.overview = 'overview 3'
    lesson3.visible_after = 'visible_after 3'

    script.save!

    expected = <<~JSON
      {
        "name": "bogus-script-1",
        "lesson_groups": [
          {
            "key": "Bogus Lesson Group 1",
            "lessons": [
              {
                "key": "Bogus-Lesson-1",
                "properties": {
                  "overview": "overview 1"
                }
              },
              {
                "key": "Bogus-Lesson-2",
                "properties": {
                  "visible_after": "visible_after 2"
                }
              }
            ]
          },
          {
            "key": "Bogus Lesson Group 2",
            "lessons": [
              {
                "key": "Bogus-Lesson-3",
                "properties": {
                  "overview": "overview 3",
                  "visible_after": "visible_after 3"
                }
              },
              {
                "key": "Bogus-Lesson-4",
                "properties": {
                }
              }
            ]
          }
        ]
      }
    JSON

    assert_equal expected.strip, LessonSeeding.serialize_lessons(script)
  end

  test 'seeding sets a new property' do
    script = create_script_with_lessons(num_lesson_groups: 1, num_lessons_per_group: 1)

    # Update a property, but don't save it.
    lesson = first_lesson_from_script(script)
    lesson.overview = 'my overview'

    # Generate JSON by serializing from the script with unsaved changes, then seed from that
    seed_lessons_from_json(LessonSeeding.serialize_lessons(script))

    assert_equal 'my overview', first_lesson_from_script(Script.find_by(name: script.name)).overview
  end

  test 'seeding updates a property' do
    script = create_script_with_lessons(num_lesson_groups: 1, num_lessons_per_group: 1)
    lesson = first_lesson_from_script(script)
    lesson.visible_after = '2050'
    lesson.save!

    # Update a property, but don't save it.
    lesson.visible_after = '3000'

    # Generate JSON by serializing from the script with unsaved changes, then seed from that
    seed_lessons_from_json(LessonSeeding.serialize_lessons(script))

    assert_equal '3000', first_lesson_from_script(Script.find_by(name: script.name)).visible_after
  end

  test 'seeding unsets a property' do
    script = create_script_with_lessons(num_lesson_groups: 1, num_lessons_per_group: 1)
    lesson = first_lesson_from_script(script)
    lesson.overview = 'my overview'
    lesson.visible_after = '2050'
    lesson.save!

    # Update a property, but don't save it.
    lesson.properties.delete('overview')

    # Generate JSON by serializing from the script with unsaved changes, then seed from that
    json = LessonSeeding.serialize_lessons(script)
    seed_lessons_from_json(json)

    reloaded_lesson = first_lesson_from_script(Script.find_by(name: script.name))
    assert_equal nil, reloaded_lesson.overview
    assert_equal '2050', reloaded_lesson.visible_after
  end

  def first_lesson_from_script(script)
    script.lesson_groups.map(&:lessons).flatten.first
  end

  def seed_lessons_from_json(script_lessons_json)
    Tempfile.create do |f|
      f << script_lessons_json
      f.rewind
      LessonSeeding.update_lessons_from_seed_files([f.path])
    end
  end

  def create_script_with_lessons(num_lesson_groups: 2, num_lessons_per_group: 2)
    # TODO: how can this be simplified and/or moved into factories.rb?
    script = create :script

    num_lesson_groups.times do
      create :lesson_group, script: script
    end

    script.lesson_groups.each do |lg|
      num_lessons_per_group.times do
        create :lesson, lesson_group: lg, script: script
      end
    end

    script
  end
end
