require 'test_helper'

class CourseTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  class CachingTests < ActiveSupport::TestCase
    def populate_cache_and_disconnect_db
      Course.stubs(:should_cache?).returns true
      @@course_cache ||= Course.course_cache_to_cache
      Course.course_cache

      # NOTE: ActiveRecord collection association still references an active DB connection,
      # even when the data is already eager loaded.
      # Best we can do is ensure that no queries are executed on the active connection.
      ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
    end

    test "get_from_cache uses cache" do
      course = create(:course, name: 'acourse')
      # Ensure cache is populated with this course by name and id
      Course.stubs(:should_cache?).returns true
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
      assert_equal 2, course.default_course_scripts.length
      assert_equal 1, course.default_course_scripts[0].position
      assert_equal 'script1', course.default_course_scripts[0].script.name
      assert_equal 2, course.default_course_scripts[1].position
      assert_equal 'script2', course.default_course_scripts[1].script.name
    end

    test "remove CourseScripts" do
      course = create :course

      create(:course_script, course: course, position: 0, script: create(:script, name: 'script1'))
      create(:course_script, course: course, position: 1, script: create(:script, name: 'script2'))

      course.update_scripts(['script2'])

      course.reload
      assert_equal 1, course.default_course_scripts.length
      assert_equal 1, course.default_course_scripts[0].position
      assert_equal 'script2', course.default_course_scripts[0].script.name
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

    course.teacher_resources = [['curriculum', '/link/to/curriculum']]

    summary = course.summarize

    assert_equal [:name, :id, :title, :description_short, :description_student,
                  :description_teacher, :scripts, :teacher_resources,
                  :has_verified_resources, :versions], summary.keys
    assert_equal 'my-course', summary[:name]
    assert_equal 'my-course-title', summary[:title]
    assert_equal 'short description', summary[:description_short]
    assert_equal 'Student description here', summary[:description_student]
    assert_equal 'Teacher description here', summary[:description_teacher]
    assert_equal 2, summary[:scripts].length
    assert_equal [['curriculum', '/link/to/curriculum']], summary[:teacher_resources]
    assert_equal false, summary[:has_verified_resources]

    # spot check that we have fields that show up in Script.summarize(false) and summarize_i18n(false)
    assert_equal 'script1', summary[:scripts][0][:name]
    assert_equal 'script1-description', summary[:scripts][0]['description']

    assert_equal 1, summary[:versions].length
    assert_equal 'my-course', summary[:versions].first[:name]
    assert_equal '2017', summary[:versions].first[:version_year]

    # make sure we dont have stage info
    assert_nil summary[:scripts][0][:stages]
    assert_nil summary[:scripts][0]['stageDescriptions']
  end

  class SelectCourseScriptTests < ActiveSupport::TestCase
    setup do
      @course = create(:course, name: 'my-course')

      @course_teacher = create :teacher
      @course_section = create :section, user: @course_teacher, course: @course
      @other_teacher = create :teacher
      @other_section = create :section, user: @other_teacher
      @student = create :student

      @script1 = create(:script, name: 'script1')
      @script2 = create(:script, name: 'script2')
      @script2a = create(:script, name: 'script2a')
      @script3 = create(:script, name: 'script3')

      create :course_script, course: @course, script: @script1, position: 1

      @default_course_script = create :course_script, course: @course, script: @script2, position: 2
      @alternate_course_script = create :course_script,
        course: @course,
        script: @script2a,
        position: 2,
        default_script: @script2,
        experiment_name: 'my-experiment'

      create :course_script, course: @course, script: @script3, position: 3
    end

    test 'course script test data is properly initialized' do
      assert_equal 'my-course', @course.name
      assert_equal %w(script1 script2 script3), @course.default_scripts.map(&:name)
      assert_equal %w(script2a), @course.alternate_course_scripts.map(&:script).map(&:name)
    end

    test 'select default course script for teacher without experiment' do
      assert_equal(
        @default_course_script,
        @course.select_course_script(@other_teacher, @default_course_script)
      )
    end

    test 'select alternate course script for teacher with experiment' do
      create :single_user_experiment, min_user_id: @other_teacher.id, name: 'my-experiment'
      assert_equal(
        @alternate_course_script,
        @course.select_course_script(@other_teacher, @default_course_script)
      )
    end

    test 'select default course script for student by default' do
      assert_equal(
        @default_course_script,
        @course.select_course_script(@student, @default_course_script)
      )
    end

    test 'select alternate course script for student when course teacher has experiment' do
      create :follower, section: @course_section, student_user: @student
      create :single_user_experiment, min_user_id: @course_teacher.id, name: 'my-experiment'
      assert_equal(
        @alternate_course_script,
        @course.select_course_script(@student, @default_course_script)
      )
    end

    test 'select default course script for student when other teacher has experiment' do
      create :follower, section: @other_section, student_user: @student
      create :single_user_experiment, min_user_id: @other_teacher.id, name: 'my-experiment'
      assert_equal(
        @default_course_script,
        @course.select_course_script(@student, @default_course_script)
      )
    end

    test 'select alternate course script for student with progress' do
      create :user_script, user: @student, script: @script2a
      assert_equal(
        @alternate_course_script,
        @course.select_course_script(@student, @default_course_script)
      )
    end

    test 'ignore progress if assigned to course teacher without experiment' do
      create :follower, section: @course_section, student_user: @student
      create :user_script, user: @student, script: @script2a
      assert_equal(
        @default_course_script,
        @course.select_course_script(@student, @default_course_script)
      )
    end
  end

  test "valid_courses" do
    # The data here must be in sync with the data in ScriptConstants.rb
    csp = create(:course, name: 'csp')
    csp1 = create(:script, name: 'csp1')
    csp2 = create(:script, name: 'csp2')
    csp2_alt = create(:script, name: 'csp2-alt', hidden: true)
    csp3 = create(:script, name: 'csp3')
    csd = create(:course, name: 'csd')
    create(:course, name: 'madeup')

    create(:course_script, position: 1, course: csp, script: csp1)
    create(:course_script, position: 2, course: csp, script: csp2)
    create(:course_script,
      position: 2,
      course: csp,
      script: csp2_alt,
      experiment_name: 'csp2-alt-experiment',
      default_script: csp2
    )
    create(:course_script, position: 3, course: csp, script: csp3)

    courses = Course.valid_courses

    # one entry for each course that is in ScriptConstants
    assert_equal 2, courses.length
    assert_equal csp.id, courses[0][:id]
    assert_equal csd.id, courses[1][:id]

    csp_assign_info = courses[0]

    # has fields from ScriptConstants::Assignable_Info
    assert_equal csp.id, csp_assign_info[:id]
    assert_equal 'csp', csp_assign_info[:script_name]
    assert_equal 0, csp_assign_info[:position]
    assert_equal(0, csp_assign_info[:category_priority])

    # has localized name, category
    assert_equal 'Computer Science Principles', csp_assign_info[:name]
    assert_equal 'Full Courses', csp_assign_info[:category]

    # has script_ids
    assert_equal [csp1.id, csp2.id, csp3.id], csp_assign_info[:script_ids]

    # teacher without experiment has default script_ids
    teacher = create(:teacher)
    courses = Course.valid_courses(teacher)
    assert_equal csp.id, courses[0][:id]
    csp_assign_info = courses[0]
    assert_equal [csp1.id, csp2.id, csp3.id], csp_assign_info[:script_ids]

    # teacher with experiment has alternate script_ids
    teacher_with_experiment = create(:teacher)
    create(:single_user_experiment, name: 'csp2-alt-experiment', min_user_id: teacher_with_experiment.id)
    courses = Course.valid_courses(teacher_with_experiment)
    assert_equal csp.id, courses[0][:id]
    csp_assign_info = courses[0]
    assert_equal [csp1.id, csp2_alt.id, csp3.id], csp_assign_info[:script_ids]
  end

  test "update_teacher_resources" do
    course = create :course
    course.update_teacher_resources(['professionalLearning'], ['/link/to/plc'])

    assert_equal [['professionalLearning', '/link/to/plc']], course.teacher_resources
  end
end
