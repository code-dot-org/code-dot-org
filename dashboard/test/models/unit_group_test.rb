require 'test_helper'

class UnitGroupTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  class CachingTests < ActiveSupport::TestCase
    def populate_cache_and_disconnect_db
      UnitGroup.stubs(:should_cache?).returns true
      @@course_cache ||= UnitGroup.course_cache_to_cache
      UnitGroup.course_cache

      # NOTE: ActiveRecord collection association still references an active DB connection,
      # even when the data is already eager loaded.
      # Best we can do is ensure that no queries are executed on the active connection.
      ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
    end

    test "get_from_cache uses cache" do
      unit_group = create(:unit_group, name: 'acourse')
      # Ensure cache is populated with this unit_group by name and id
      UnitGroup.stubs(:should_cache?).returns true
      UnitGroup.get_from_cache(unit_group.name)
      UnitGroup.get_from_cache(unit_group.id)

      uncached_unit_group = UnitGroup.get_without_cache(unit_group.id)

      populate_cache_and_disconnect_db

      # Uncached find should raise because db was disconnected
      assert_raises do
        UnitGroup.find_by_name('acourse')
      end

      assert_equal uncached_unit_group, UnitGroup.get_from_cache('acourse')
      assert_equal uncached_unit_group, UnitGroup.get_from_cache(unit_group.id)
    end
  end

  class NameValidationTests < ActiveSupport::TestCase
    test "should allow valid unit_group names" do
      create(:unit_group, name: 'valid-name')
    end

    test "should not allow uppercase letters in unit_group name" do
      assert_raises ActiveRecord::RecordInvalid do
        create(:unit_group, name: 'UpperCase')
      end
    end

    test "should not allow spaces in unit_group name" do
      assert_raises ActiveRecord::RecordInvalid do
        create(:unit_group, name: 'spaced out')
      end
    end

    test "should allow uppercase letters if it is a plc course" do
      unit_group = UnitGroup.new(name: 'PLC Course')
      unit_group.plc_course = Plc::Course.new(unit_group: unit_group)
      unit_group.save!
    end
  end

  test "should serialize to json" do
    unit_group = create(:unit_group, name: 'my-unit-group', is_stable: true)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "script1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "script2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "script3"))

    serialization = unit_group.serialize

    obj = JSON.parse(serialization)
    assert_equal 'my-unit-group', obj['name']
    assert_equal ['script1', 'script2', 'script3'], obj['script_names']
    assert obj['properties']['is_stable']
  end

  test "stable?: true if unit_group has plc_course" do
    unit_group = UnitGroup.new(family_name: 'plc')
    unit_group.plc_course = Plc::Course.new(unit_group: unit_group)
    unit_group.save

    assert unit_group.stable?
  end

  test "stable?: true if unit_group is not in a family" do
    unit_group = create :unit_group
    assert unit_group.stable?
  end

  test "stable?: true if unit_group in family has is_stable set" do
    unit_group = create :unit_group, family_name: 'csd', is_stable: true
    assert unit_group.stable?
  end

  test "stable?: defaults to false if unit_group in family does not have is_stable set" do
    unit_group = create :unit_group, family_name: 'csd'
    refute unit_group.stable?
  end

  class UpdateScriptsTests < ActiveSupport::TestCase
    test "add CourseScripts" do
      unit_group = create :unit_group

      create(:script, name: 'script1')
      create(:script, name: 'script2')

      unit_group.update_scripts(['script1', 'script2'])

      unit_group.reload
      assert_equal 2, unit_group.default_unit_group_units.length
      assert_equal 1, unit_group.default_unit_group_units[0].position
      assert_equal 'script1', unit_group.default_unit_group_units[0].script.name
      assert_equal 2, unit_group.default_unit_group_units[1].position
      assert_equal 'script2', unit_group.default_unit_group_units[1].script.name
    end

    test "remove CourseScripts" do
      unit_group = create :unit_group

      create(:unit_group_unit, unit_group: unit_group, position: 0, script: create(:script, name: 'script1'))
      create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: 'script2'))

      unit_group.update_scripts(['script2'])

      unit_group.reload
      assert_equal 1, unit_group.default_unit_group_units.length
      assert_equal 1, unit_group.default_unit_group_units[0].position
      assert_equal 'script2', unit_group.default_unit_group_units[0].script.name
    end
  end

  test "summarize" do
    unit_group = create :unit_group, name: 'my-unit-group', family_name: 'my-family', version_year: '1999'

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'course' => {
          'name' => {
            'my-unit-group' => {
              'title' => 'my-unit-group-title',
              'description_short' => 'short description',
              'description_student' => 'Student description here',
              'description_teacher' => 'Teacher description here',
              'version_title' => 'Version title',
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

    create(:unit_group_unit, unit_group: unit_group, position: 0, script: create(:script, name: 'script1'))
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: 'script2'))

    unit_group.teacher_resources = [['curriculum', '/link/to/curriculum']]

    summary = unit_group.summarize

    assert_equal [:name, :id, :title, :assignment_family_title,
                  :family_name, :version_year, :visible, :is_stable,
                  :pilot_experiment, :description_short, :description_student,
                  :description_teacher, :version_title, :scripts, :teacher_resources,
                  :has_verified_resources, :versions, :show_assign_button], summary.keys
    assert_equal 'my-unit-group', summary[:name]
    assert_equal 'my-unit-group-title', summary[:title]
    assert_equal 'short description', summary[:description_short]
    assert_equal 'Student description here', summary[:description_student]
    assert_equal 'Teacher description here', summary[:description_teacher]
    assert_equal 'Version title', summary[:version_title]
    assert_equal 2, summary[:scripts].length
    assert_equal [['curriculum', '/link/to/curriculum']], summary[:teacher_resources]
    assert_equal false, summary[:has_verified_resources]

    # spot check that we have fields that show up in Script.summarize(false) and summarize_i18n(false)
    assert_equal 'script1', summary[:scripts][0][:name]
    assert_equal 'script1-description', summary[:scripts][0]['description']

    assert_equal 1, summary[:versions].length
    assert_equal 'my-unit-group', summary[:versions].first[:name]
    assert_equal '1999', summary[:versions].first[:version_year]

    # make sure we dont have stage info
    assert_nil summary[:scripts][0][:stages]
    assert_nil summary[:scripts][0]['stageDescriptions']
  end

  test 'summarize_version' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', visible: true, is_stable: true)
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', visible: true, is_stable: true)
    csp_2019 = create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', visible: true)
    csp_2020 = create(:unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2019')

    [csp_2017, csp_2018, csp_2019].each do |c|
      summary = c.summarize_versions
      assert_equal ['csp-2019', 'csp-2018', 'csp-2017'], summary.map {|h| h[:name]}
      assert_equal [false, true, true], summary.map {|h| h[:is_stable]}
    end

    # Result should include self, even if it's not visible
    summary = csp_2020.summarize_versions
    assert_equal ['csp-2020', 'csp-2019', 'csp-2018', 'csp-2017'], summary.map {|h| h[:name]}
  end

  class SelectCourseScriptTests < ActiveSupport::TestCase
    setup do
      @unit_group = create(:unit_group, name: 'my-unit-group')

      @course_teacher = create :teacher
      @course_section = create :section, user: @course_teacher, unit_group: @unit_group
      @other_teacher = create :teacher
      @other_section = create :section, user: @other_teacher
      @student = create :student

      @script1 = create(:script, name: 'script1')
      @script2 = create(:script, name: 'script2')
      @script2a = create(:script, name: 'script2a')
      @script3 = create(:script, name: 'script3')

      create :unit_group_unit, unit_group: @unit_group, script: @script1, position: 1

      @unit_group_unit = create :unit_group_unit, unit_group: @unit_group, script: @script2, position: 2
      @alternate_unit_group_unit = create :unit_group_unit,
        unit_group: @unit_group,
        script: @script2a,
        position: 2,
        default_script: @script2,
        experiment_name: 'my-experiment'

      create :unit_group_unit, unit_group: @unit_group, script: @script3, position: 3
    end

    test 'unit group unit test data is properly initialized' do
      assert_equal 'my-unit-group', @unit_group.name
      assert_equal %w(script1 script2 script3), @unit_group.default_scripts.map(&:name)
      assert_equal %w(script2a), @unit_group.alternate_unit_group_units.map(&:script).map(&:name)
    end

    test 'select default unit group unit for teacher without experiment' do
      assert_equal(
        @unit_group_unit,
        @unit_group.select_unit_group_unit(@other_teacher, @unit_group_unit)
      )
    end

    test 'select alternate unit group unit for teacher with experiment' do
      experiment = create :single_user_experiment, min_user_id: @other_teacher.id, name: 'my-experiment'
      assert_equal(
        @alternate_unit_group_unit,
        @unit_group.select_unit_group_unit(@other_teacher, @unit_group_unit)
      )
      experiment.destroy
    end

    test 'select default unit group unit for student by default' do
      assert_equal(
        @unit_group_unit,
        @unit_group.select_unit_group_unit(@student, @unit_group_unit)
      )
    end

    test 'select alternate unit group unit for student when unit_group teacher has experiment' do
      create :follower, section: @course_section, student_user: @student
      experiment = create :single_user_experiment, min_user_id: @course_teacher.id, name: 'my-experiment'
      assert_equal(
        @alternate_unit_group_unit,
        @unit_group.select_unit_group_unit(@student, @unit_group_unit)
      )
      experiment.destroy
    end

    test 'select default unit group unit for student when other teacher has experiment' do
      create :follower, section: @other_section, student_user: @student
      experiment = create :single_user_experiment, min_user_id: @other_teacher.id, name: 'my-experiment'
      assert_equal(
        @unit_group_unit,
        @unit_group.select_unit_group_unit(@student, @unit_group_unit)
      )
      experiment.destroy
    end

    test 'select alternate unit group unit for student with progress' do
      create :user_script, user: @student, script: @script2a
      assert_equal(
        @alternate_unit_group_unit,
        @unit_group.select_unit_group_unit(@student, @unit_group_unit)
      )
    end

    test 'ignore progress if assigned to unit_group teacher without experiment' do
      create :follower, section: @course_section, student_user: @student
      create :user_script, user: @student, script: @script2a
      assert_equal(
        @unit_group_unit,
        @unit_group.select_unit_group_unit(@student, @unit_group_unit)
      )
    end
  end

  class RedirectCourseUrl < ActiveSupport::TestCase
    setup do
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    end

    test 'returns nil for nil user' do
      assert_nil @csp_2017.redirect_to_course_url(nil)
    end

    test 'returns nil for teacher' do
      teacher = create :teacher
      assert_nil @csp_2017.redirect_to_course_url(teacher)
    end

    test 'returns nil for student assigned to this unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      section = create :section, unit_group: @csp_2017
      student = create :student
      section.students << student
      assert_nil @csp_2017.redirect_to_course_url(student)
    end

    test 'returns nil for student not assigned to any unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      student = create :student
      assert_nil @csp_2017.redirect_to_course_url(student)
    end

    test 'returns link to latest assigned unit_group for student assigned to a unit_group in this family' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      section = create :section, unit_group: csp_2018
      student = create :student
      section.students << student
      assert_equal csp_2018.link, @csp_2017.redirect_to_course_url(student)
    end

    test 'returns nil if latest assigned unit_group is an older version than the current unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      section = create :section, unit_group: @csp_2017
      student = create :student
      section.students << student
      assert_nil csp_2018.redirect_to_course_url(student)
    end
  end

  class CanViewVersion < ActiveSupport::TestCase
    setup do
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', is_stable: true)
      @csp1_2017 = create(:script, name: 'csp1-2017')
      create :unit_group_unit, unit_group: @csp_2017, script: @csp1_2017, position: 1
      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', is_stable: true)
      create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019')
      @student = create :student
    end

    test 'teacher can always view version' do
      assert @csp_2017.can_view_version?(create(:teacher))
    end

    test 'nil user can only view latest version in course family' do
      assert @csp_2018.can_view_version?(nil)
      refute @csp_2017.can_view_version?(nil)
    end

    test 'student can view version if it is the latest version in course family' do
      assert @csp_2018.can_view_version?(@student)
      refute @csp_2017.can_view_version?(@student)
    end

    test 'student can view version if it is assigned to them' do
      create :follower, section: create(:section, unit_group: @csp_2018), student_user: @student
      create :follower, section: create(:section, unit_group: @csp_2017), student_user: @student

      assert @csp_2018.can_view_version?(@student)
      assert @csp_2017.can_view_version?(@student)
    end

    test 'student can view version if they have progress in it' do
      create :user_script, user: @student, script: @csp1_2017
      assert @csp_2017.can_view_version?(@student)
    end
  end

  class LatestVersionTests < ActiveSupport::TestCase
    setup do
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', is_stable: true)
      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', is_stable: true)
      create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', is_stable: false)
      @student = create :student
    end

    test 'latest_stable_version returns nil if course family does not exist' do
      assert_nil UnitGroup.latest_stable_version('fake-family')
    end

    test 'latest_stable_version returns latest course version' do
      latest_version = UnitGroup.latest_stable_version('csp')
      assert_equal @csp_2018, latest_version
    end

    test 'latest_assigned_version returns latest version in family assigned to student' do
      create :follower, section: create(:section, unit_group: @csp_2017), student_user: @student
      latest_assigned_version = UnitGroup.latest_assigned_version('csp', @student)
      assert_equal @csp_2017, latest_assigned_version
    end
  end

  class ProgressTests < ActiveSupport::TestCase
    setup do
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
      @csp1_2017 = create(:script, name: 'csp1-2017')
      @csp2_2017 = create(:script, name: 'csp2-2017')
      create :unit_group_unit, unit_group: @csp_2017, script: @csp1_2017, position: 1
      create :unit_group_unit, unit_group: @csp_2017, script: @csp2_2017, position: 1

      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      @csp1_2018 = create(:script, name: 'csp1-2018')
      @csp2_2018 = create(:script, name: 'csp2-2018')
      create :unit_group_unit, unit_group: @csp_2018, script: @csp1_2018, position: 1
      create :unit_group_unit, unit_group: @csp_2018, script: @csp2_2018, position: 1

      @csd = create(:unit_group, name: 'csd')
      @csd1 = create(:script, name: 'csd1')
      create :unit_group_unit, unit_group: @csd, script: @csd1, position: 1

      @student = create :student
    end

    test 'validate test data' do
      assert_equal 2, @csp_2017.default_scripts.count
      assert_equal 2, @csp_2018.default_scripts.count
      assert_equal 1, @csd.default_scripts.count
    end

    test 'student with no progress has no progress' do
      refute @csp_2017.has_progress?(@student)
      refute @csp_2018.has_progress?(@student)
    end

    test 'student with progress in unit_group has progress' do
      create :user_script, user: @student, script: @csp1_2017

      assert @csp_2017.has_progress?(@student)
      refute @csp_2018.has_progress?(@student)
    end

    test 'student with no progress does not have older version progress' do
      refute @csp_2017.has_older_version_progress?(@student)
      refute @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in older course version has older version progress' do
      create :user_script, user: @student, script: @csp1_2017

      refute @csp_2017.has_older_version_progress?(@student)
      assert @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in both course versions has older version progress' do
      create :user_script, user: @student, script: @csp1_2017
      create :user_script, user: @student, script: @csp2_2018

      refute @csp_2017.has_older_version_progress?(@student)
      assert @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in other course family does not have older version progress' do
      create :user_script, user: @student, script: @csd1

      refute @csp_2017.has_older_version_progress?(@student)
      refute @csp_2018.has_older_version_progress?(@student)
    end
  end

  test "valid_courses" do
    csp = create(:unit_group, name: 'csp-2017', visible: true, is_stable: true)
    # Should still be in valid_courses if visible and not stable
    csd = create(:unit_group, name: 'csd-2017', visible: true)
    create(:unit_group, name: 'madeup')

    assert_equal [csp, csd], UnitGroup.valid_courses
  end

  test "assignable_info" do
    csp = create(:unit_group, name: 'csp-2017', visible: true, is_stable: true)
    csp1 = create(:script, name: 'csp1')
    csp2 = create(:script, name: 'csp2')
    csp2_alt = create(:script, name: 'csp2-alt', hidden: true)
    csp3 = create(:script, name: 'csp3')

    create(:unit_group_unit, position: 1, unit_group: csp, script: csp1)
    create(:unit_group_unit, position: 2, unit_group: csp, script: csp2)
    create(:unit_group_unit,
      position: 2,
      unit_group: csp,
      script: csp2_alt,
      experiment_name: 'csp2-alt-experiment',
      default_script: csp2
    )
    create(:unit_group_unit, position: 3, unit_group: csp, script: csp3)

    csp_assign_info = csp.assignable_info

    # has fields from ScriptConstants::Assignable_Info
    assert_equal csp.id, csp_assign_info[:id]
    assert_equal 'csp-2017', csp_assign_info[:script_name]
    assert_equal(-1, csp_assign_info[:category_priority])

    # has localized name, category
    assert_equal "Computer Science Principles ('17-'18)", csp_assign_info[:name]
    assert_equal 'Full Courses', csp_assign_info[:category]

    # has script_ids
    assert_equal [csp1.id, csp2.id, csp3.id], csp_assign_info[:script_ids]

    # teacher without experiment has default script_ids
    teacher = create(:teacher)
    csp_assign_info = csp.assignable_info(teacher)
    assert_equal csp.id, csp_assign_info[:id]
    assert_equal [csp1.id, csp2.id, csp3.id], csp_assign_info[:script_ids]

    # teacher with experiment has alternate script_ids
    teacher_with_experiment = create(:teacher)
    experiment = create(:single_user_experiment, name: 'csp2-alt-experiment', min_user_id: teacher_with_experiment.id)
    csp_assign_info = csp.assignable_info(teacher_with_experiment)
    assert_equal csp.id, csp_assign_info[:id]
    assert_equal [csp1.id, csp2_alt.id, csp3.id], csp_assign_info[:script_ids]
    experiment.destroy
  end

  test "self.valid_courses: omits pilot courses" do
    student = create :student
    teacher = create :teacher
    levelbuilder = create :levelbuilder
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    create :unit_group, pilot_experiment: 'my-experiment'
    assert UnitGroup.any?(&:pilot?)

    refute UnitGroup.valid_courses(user: student).any?(&:pilot_experiment)
    refute UnitGroup.valid_courses(user: teacher).any?(&:pilot_experiment)
    assert UnitGroup.valid_courses(user: pilot_teacher).any?(&:pilot_experiment)
    assert UnitGroup.valid_courses(user: levelbuilder).any?(&:pilot_experiment)
  end

  test "valid_courses: pilot experiment results not cached" do
    teacher = create :teacher
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'

    csp_2019 = create :unit_group, name: 'csp-2019', visible: true
    csp_2020 = create :unit_group, name: 'csp-2020', pilot_experiment: 'my-experiment'

    assert_equal UnitGroup.valid_courses, [csp_2019]
    assert_equal UnitGroup.valid_courses(user: teacher), [csp_2019]
    # We had a caching bug where valid_courses with a user with pilot experiment would mutate the value stored
    # in the Rails cache, causing the course behind the experiment to be returned for all calls afterwards.
    # Verify that the results are still correct after this call.
    assert_equal UnitGroup.valid_courses(user: pilot_teacher), [csp_2019, csp_2020]
    assert_equal UnitGroup.valid_courses, [csp_2019]
    assert_equal UnitGroup.valid_courses(user: teacher), [csp_2019]
  end

  test "update_teacher_resources" do
    unit_group = create :unit_group
    unit_group.update_teacher_resources(['professionalLearning'], ['/link/to/plc'])

    assert_equal [['professionalLearning', '/link/to/plc']], unit_group.teacher_resources
  end

  test 'has pilot access' do
    unit_group = create :unit_group
    pilot_unit_group = create :unit_group, pilot_experiment: 'my-experiment'
    script_in_pilot_unit_group = create :script
    create :unit_group_unit, unit_group: pilot_unit_group, script: script_in_pilot_unit_group, position: 1

    student = create :student
    teacher = create :teacher

    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'

    # student in a pilot teacher's section which is assigned to a pilot unit group
    pilot_section = create :section, user: pilot_teacher, unit_group: pilot_unit_group
    assigned_pilot_student = create(:follower, section: pilot_section).student_user

    # teacher in a pilot teacher's section, assigned to the unit group
    teacher_in_section = create :teacher
    create(:follower, section: pilot_section, student_user: teacher_in_section)

    # student who has progress in a pilot unit group, but is not currently assigned to it
    other_section = create :section, user: pilot_teacher, unit_group: pilot_unit_group
    pilot_student_with_progress = create :student
    create(:follower, section: other_section, student_user: pilot_student_with_progress)
    create :user_script, user: pilot_student_with_progress, script: script_in_pilot_unit_group

    # student of pilot teacher, without assignment or progress
    non_pilot_section = create :section, user: pilot_teacher
    student_of_pilot_teacher = create(:follower, section: non_pilot_section).student_user

    levelbuilder = create :levelbuilder

    refute unit_group.pilot?
    refute unit_group.has_pilot_access?
    refute unit_group.has_pilot_access?(student)
    refute unit_group.has_pilot_access?(teacher)
    refute unit_group.has_pilot_access?(pilot_teacher)
    refute unit_group.has_pilot_access?(assigned_pilot_student)
    refute unit_group.has_pilot_access?(teacher_in_section)
    refute unit_group.has_pilot_access?(pilot_student_with_progress)
    refute unit_group.has_pilot_access?(student_of_pilot_teacher)
    refute unit_group.has_pilot_access?(levelbuilder)

    assert pilot_unit_group.pilot?
    refute pilot_unit_group.has_pilot_access?
    refute pilot_unit_group.has_pilot_access?(student)
    refute pilot_unit_group.has_pilot_access?(teacher)
    assert pilot_unit_group.has_pilot_access?(pilot_teacher)
    assert pilot_unit_group.has_pilot_access?(assigned_pilot_student)
    assert pilot_unit_group.has_pilot_access?(teacher_in_section)
    assert pilot_unit_group.has_pilot_access?(pilot_student_with_progress)
    refute unit_group.has_pilot_access?(student_of_pilot_teacher)
    assert pilot_unit_group.has_pilot_access?(levelbuilder)
  end

  test 'has any pilot access' do
    student = create :student
    teacher = create :teacher
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    create :unit_group, pilot_experiment: 'my-experiment'
    levelbuilder = create :levelbuilder

    refute UnitGroup.has_any_pilot_access?
    refute UnitGroup.has_any_pilot_access?(student)
    refute UnitGroup.has_any_pilot_access?(teacher)
    assert UnitGroup.has_any_pilot_access?(pilot_teacher)
    assert UnitGroup.has_any_pilot_access?(levelbuilder)
  end
end
