require 'test_helper'

class CourseTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  class CachingTests < ActiveSupport::TestCase
    def populate_cache_and_disconnect_db
      Course.stubs(:should_cache?).returns true
      @@course_cache ||= Course.course_cache_to_cache
      Course.course_cache_from_cache

      # NOTE: ActiveRecord collection association still references an active DB connection,
      # even when the data is already eager loaded.
      # Best we can do is ensure that no queries are executed on the active connection.
      ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
    end

    test "get_from_cache uses cache" do
      course = create(:course, name: 'acourse')
      # Ensure cache is populated with this course by name and id
      Course.get_from_cache(course.name)
      Course.get_from_cache(course.id)

      uncached_course = Course.get_without_cache(course.id)

      populate_cache_and_disconnect_db

      # Uncached find should raise because db was disconnected
      assert_raises do
        Course.find_by_name('acourse')
      end

      assert_equal uncached_course, Course.get_from_cache('acourse')
      assert_equal uncached_course, Course.get_from_cache(course.id)
    end
  end

  class NameValidationTests < ActiveSupport::TestCase
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

  test "should serialize to json" do
    course = create(:course, name: 'my-course')
    create(:course_script, course: course, position: 1, script: create(:script, name: "script1"))
    create(:course_script, course: course, position: 2, script: create(:script, name: "script2"))
    create(:course_script, course: course, position: 3, script: create(:script, name: "script3"))

    serialization = course.serialize

    obj = JSON.parse(serialization)
    assert_equal 'my-course', obj['name']
    assert_equal ['script1', 'script2', 'script3'], obj['script_names']
  end

  class UpdateScriptsTests < ActiveSupport::TestCase
    test "add CourseScripts" do
      course = create :course

      create(:script, name: 'script1')
      create(:script, name: 'script2')

      course.update_scripts(['script1', 'script2'])

      course.reload
      assert_equal 2, course.course_scripts.length
      assert_equal 1, course.course_scripts[0].position
      assert_equal 'script1', course.course_scripts[0].script.name
      assert_equal 2, course.course_scripts[1].position
      assert_equal 'script2', course.course_scripts[1].script.name
    end

    test "remove CourseScripts" do
      course = create :course

      create(:course_script, course: course, position: 0, script: create(:script, name: 'script1'))
      create(:course_script, course: course, position: 1, script: create(:script, name: 'script2'))

      course.update_scripts(['script2'])

      course.reload
      assert_equal 1, course.course_scripts.length
      assert_equal 1, course.course_scripts[0].position
      assert_equal 'script2', course.course_scripts[0].script.name
    end
  end

  test "summarize" do
    course = create :course, name: 'my-course'

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'course' => {
          'name' => {
            'my-course' => {
              'title' => 'my-course-title',
              'description_short' => 'short description',
              'description_student' => 'Student description here',
              'description_teacher' => 'Teacher description here'
            }
          }
        },
        'script' => {
          'name' => {
            'script1' => {
              'description' => 'script1-description'
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    create(:course_script, course: course, position: 0, script: create(:script, name: 'script1'))
    create(:course_script, course: course, position: 1, script: create(:script, name: 'script2'))

    summary = course.summarize

    assert_equal [:name, :title, :description_short, :description_student, :description_teacher, :scripts], summary.keys
    assert_equal 'my-course', summary[:name]
    assert_equal 'my-course-title', summary[:title]
    assert_equal 'short description', summary[:description_short]
    assert_equal 'Student description here', summary[:description_student]
    assert_equal 'Teacher description here', summary[:description_teacher]
    assert_equal 2, summary[:scripts].length

    # spot check that we have fields that show up in Script.summarize(false) and summarize_i18n(false)
    assert_equal 'script1', summary[:scripts][0][:name]
    assert_equal 'script1-description', summary[:scripts][0]['description']

    # make sure we dont have stage info
    assert_nil summary[:scripts][0][:stages]
    assert_nil summary[:scripts][0]['stageDescriptions']
  end

  test "load_from_path" do
    create(:script, name: 'script1')
    create(:script, name: 'script2')

    serialization = {
      name: 'this-course',
      script_names: ['script1', 'script2']
    }.to_json
    File.stubs(:read).returns(serialization)

    Course.load_from_path('file_path')

    course = Course.find_by_name!('this-course')
    assert_equal 2, CourseScript.where(course: course).length
  end
end
