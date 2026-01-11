require 'test_helper'

class UnitGroupTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup do
    File.stubs(:write)
  end

  class CachingTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)
    end

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
    setup do
      File.stubs(:write)
    end

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

  test 'should raise error if plc course is being launched' do
    unit_group = create(:unit_group, family_name: 'plc')
    unit_group.plc_course = Plc::Course.new(unit_group: unit_group)
    unit_group.save!

    error = assert_raises do
      unit_group.published_state = 'stable'
      unit_group.save!
    end

    assert_includes error.message, 'Validation failed: Published state can never be pilot, preview or stable for a plc course.'
  end

  test "should serialize to json" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))

    serialization = unit_group.serialize

    obj = JSON.parse(serialization)
    assert_equal 'my-unit-group', obj['name']
    assert_equal ['unit1', 'unit2', 'unit3'], obj['script_names']
    assert_equal obj['published_state'], Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    assert_equal obj['instruction_type'], Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
    assert_equal obj['instructor_audience'], Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
    assert_equal obj['participant_audience'], Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
  end

  test "should serialize resources to json" do
    course_version = create(:course_version)
    unit_group = create(:unit_group, name: 'my-unit-group', course_version: course_version, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))
    unit_group.resources = [create(:resource, course_version: course_version), create(:resource, course_version: course_version)]
    unit_group.student_resources = [create(:resource, course_version: course_version)]

    serialization = unit_group.serialize

    obj = JSON.parse(serialization)
    assert_equal 'my-unit-group', obj['name']
    assert_equal ['unit1', 'unit2', 'unit3'], obj['script_names']
    assert_equal obj['published_state'], Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    assert_equal 2, obj['resources'].length
    assert_equal 1, obj['student_resources'].length
  end

  test "can seed unit group from hash" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))

    serialization = unit_group.serialize
    unit_group.original_units.each {|u| u.update!(original_unit_group: nil)}
    unit_group.destroy

    seeded_unit_group = UnitGroup.seed_from_hash(JSON.parse(serialization))
    assert_equal 'my-unit-group', seeded_unit_group.name
    assert_equal 'stable', seeded_unit_group.published_state
    assert_equal 'self_paced', seeded_unit_group.instruction_type
    assert_equal 'teacher', seeded_unit_group.participant_audience
    assert_equal 'facilitator', seeded_unit_group.instructor_audience
    assert_equal 3, seeded_unit_group.default_unit_group_units.length
    assert_equal 3, seeded_unit_group.default_units.length
  end

  test "can seed course version for unit group from hash" do
    unit_group = create(:unit_group, name: 'my-unit-group', family_name: 'family', version_year: '2021', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)

    serialization = unit_group.serialize
    unit_group.destroy

    seeded_unit_group = UnitGroup.seed_from_hash(JSON.parse(serialization))
    assert_equal 'my-unit-group', seeded_unit_group.name
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, seeded_unit_group.published_state
    assert_equal Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led, seeded_unit_group.instruction_type
    assert_equal Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student, seeded_unit_group.participant_audience
    assert_equal Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, seeded_unit_group.instructor_audience
    course_version = seeded_unit_group.course_version
    refute_nil course_version
    assert_equal '2021', course_version.key
    assert_equal 'family', course_version.course_offering&.key
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, course_version.published_state
  end

  test "can seed unit group and create resources from hash" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'test', version_year: '2000')
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))
    unit_group.resources = [create(:resource, course_version: course_version), create(:resource, course_version: course_version)]
    unit_group.student_resources = [create(:resource, course_version: course_version)]

    serialization = unit_group.serialize
    unit_group.destroy
    course_version.destroy

    seeded_unit_group = UnitGroup.seed_from_hash(JSON.parse(serialization))
    assert_equal 'my-unit-group', seeded_unit_group.name
    assert_equal 3, seeded_unit_group.default_unit_group_units.length
    assert_equal 3, seeded_unit_group.default_units.length
    assert_equal 2, seeded_unit_group.resources.length
    assert_equal 1, seeded_unit_group.student_resources.length
  end

  test "can seed unit group and only update resources from course version" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'test', version_year: '2000')
    CourseOffering.add_course_offering(unit_group)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))
    resource = create(:resource, course_version: create(:course_version))
    resource_in_unit = create(:resource, course_version: unit_group.course_version)
    unit_group.resources = [resource_in_unit]

    serialization = unit_group.serialize

    hash = JSON.parse(serialization)
    hash['resources'][0]['name'] = 'updated name'
    seeded_unit_group = UnitGroup.seed_from_hash(hash)
    resource.reload
    resource_in_unit.reload
    assert_equal 1, seeded_unit_group.resources.length
    assert_equal 'updated name', seeded_unit_group.resources[0].name
    assert_equal 'updated name', resource_in_unit.name
    refute_equal 'updated name', resource.name
  end

  test "can seed unit group and remove resources from hash" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'test', version_year: '2000')
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))
    unit_group.resources = [create(:resource, course_version: course_version), create(:resource, course_version: course_version)]

    serialization = unit_group.serialize
    unit_group.destroy
    course_version.destroy

    hash = JSON.parse(serialization)
    hash.delete('resources')
    seeded_unit_group = UnitGroup.seed_from_hash(hash)
    assert_equal 'my-unit-group', seeded_unit_group.name
    assert_equal 3, seeded_unit_group.default_unit_group_units.length
    assert_equal 3, seeded_unit_group.default_units.length
    assert_equal 0, seeded_unit_group.resources.length
  end

  test "can seed unit group and update resources from hash" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'test', version_year: '2000')
    CourseOffering.add_course_offering(unit_group)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))
    resource = create(:resource, course_version: unit_group.course_version)
    unit_group.resources = [resource]

    serialization = unit_group.serialize

    hash = JSON.parse(serialization)
    hash['resources'][0]['name'] = 'updated name'
    seeded_unit_group = UnitGroup.seed_from_hash(hash)
    resource.reload
    assert_equal 1, seeded_unit_group.resources.length
    assert_equal 'updated name', seeded_unit_group.resources[0].name
    assert_equal 'updated name', resource.name
  end

  test "can seed from hash and update and remove student resources" do
    unit_group = create(:unit_group, name: 'my-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'test', version_year: '2000')
    CourseOffering.add_course_offering(unit_group)
    course_version = unit_group.course_version
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    create(:unit_group_unit, unit_group: unit_group, position: 2, script: create(:script, name: "unit2"))
    create(:unit_group_unit, unit_group: unit_group, position: 3, script: create(:script, name: "unit3"))

    resource_to_update = create(:resource, course_version: course_version)
    resource_to_delete = create(:resource, course_version: course_version)
    unit_group.student_resources = [resource_to_update, resource_to_delete]

    serialization = unit_group.serialize

    hash = JSON.parse(serialization)
    hash['student_resources'] = hash['student_resources'][0...1]
    hash['student_resources'][0]['name'] = 'updated name'
    seeded_unit_group = UnitGroup.seed_from_hash(hash)
    assert_equal 'my-unit-group', seeded_unit_group.name
    assert_equal 3, seeded_unit_group.default_unit_group_units.length
    assert_equal 3, seeded_unit_group.default_units.length
    assert_equal 1, seeded_unit_group.student_resources.length
    resource_to_update.reload
    assert_equal 'updated name', resource_to_update.name
  end

  test "stable?: true if unit_group has plc_course" do
    unit_group = create(:unit_group, family_name: 'plc')
    unit_group.plc_course = Plc::Course.new(unit_group: unit_group)
    unit_group.save

    assert unit_group.stable?
  end

  test "stable?: true if unit_group has published_state of stable" do
    unit_group = create(:unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    assert unit_group.stable?
  end

  test "stable?: defaults to false if unit_group does not have published_state of stable" do
    unit_group = create(:unit_group)
    refute unit_group.stable?
  end

  class UpdateOriginalScriptsTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)
    end

    test "update original scripts" do
      unit_group = create(:unit_group)

      unit1 = create(:script, name: 'unit1')
      unit2 = create(:script, name: 'unit2')

      unit_group.update_original_scripts(['unit1', 'unit2'])

      unit_group.reload
      unit1.reload
      unit2.reload

      assert_equal 2, unit_group.original_units.length
      assert_equal unit_group, unit1.original_unit_group
      assert_equal unit_group, unit2.original_unit_group
    end

    test "remove original scripts" do
      unit_group = create(:unit_group)

      create(:script, name: 'unit1')
      create(:script, name: 'unit2')

      unit_group.update_original_scripts(['unit1', 'unit2'])

      unit_group.reload

      assert_equal 2, unit_group.original_units.length

      unit_group.update_original_scripts(['unit1'])
      unit_group.reload
      assert_equal 1, unit_group.original_units.length
    end

    test "change original unit group if a unit already has a unit group" do
      unit_group1 = create(:unit_group)

      unit1 = create(:script, name: 'unit1')
      create(:script, name: 'unit2')

      unit_group1.update_original_scripts(['unit1', 'unit2'])
      unit_group1.reload
      unit1.reload
      assert_equal 2, unit_group1.original_units.length

      unit_group2 = create(:unit_group)
      unit_group2.update_original_scripts(['unit1'])
      unit_group2.reload
      unit1.reload
      assert_equal 1, unit_group2.original_units.length
      assert_equal unit_group2, unit1.original_unit_group
    end
  end

  class UpdateScriptsTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)
    end

    test "add UnitGroupUnits" do
      unit_group = create(:unit_group)

      create(:script, name: 'unit1')
      create(:script, name: 'unit2')

      unit_group.update_scripts(['unit1', 'unit2'])

      unit_group.reload
      assert_equal 2, unit_group.default_unit_group_units.length
      assert_equal 1, unit_group.default_unit_group_units[0].position
      assert_equal 'unit1', unit_group.default_unit_group_units[0].script.name
      assert_equal 2, unit_group.default_unit_group_units[1].position
      assert_equal 'unit2', unit_group.default_unit_group_units[1].script.name
    end

    test "add original unit if unit does not have original unit" do
      # Original unit group = the first unit group the unit was assigned
      unit_group = create(:unit_group)

      unit1 = create(:script, name: 'unit1')
      unit2 = create(:script, name: 'unit2')

      unit_group.update_scripts(['unit1', 'unit2'])

      unit_group.reload
      unit1.reload
      unit2.reload

      assert_equal 2, unit_group.default_unit_group_units.length
      assert_equal 1, unit_group.default_unit_group_units[0].position
      assert_equal 'unit1', unit_group.default_unit_group_units[0].script.name
      assert_equal 2, unit_group.default_unit_group_units[1].position
      assert_equal 'unit2', unit_group.default_unit_group_units[1].script.name
      assert_equal 2, unit_group.original_units.length
      assert_equal unit_group, unit1.original_unit_group
      assert_equal unit_group, unit2.original_unit_group
    end

    test "do not add original unit group if a unit already has an original unit group" do
      unit_group1 = create(:unit_group)

      unit1 = create(:script, name: 'unit1')

      unit_group1.update_original_scripts(['unit1'])
      unit_group1.reload
      unit1.reload

      assert_equal 1, unit_group1.original_units.length
      assert_equal unit_group1, unit1.original_unit_group

      unit_group2 = create(:unit_group)
      unit_group2.update_scripts(['unit1'])

      unit_group2.reload
      unit1.reload

      assert_equal 0, unit_group2.original_units.length
      assert_equal 1, unit_group2.default_units.length
      assert_equal unit_group1, unit1.original_unit_group
    end

    test "cannot remove UnitGroupUnits from their original course that cannot change course version" do
      course_version = create(:course_version)
      unit_group = create(:unit_group, course_version: course_version)

      unit1 = create(:script, name: 'unit1')
      create(:script, name: 'unit2')
      unit_group.update_scripts(['unit1', 'unit2'])

      lesson = create(:lesson)
      resource = create(:resource, course_version: course_version)
      lesson.resources = [resource]
      lesson_group = create(:lesson_group, lessons: [lesson])
      unit1.lesson_groups = [lesson_group]

      unit_group.reload
      error = assert_raises RuntimeError do
        unit_group.update_scripts(['unit2'])
      end
      assert_includes error.message, 'Cannot remove units from their original course if they have resources or vocab'

      unit_group.reload
      assert_equal 2, unit_group.default_unit_group_units.length
    end

    test "remove UnitGroupUnits" do
      unit_group = create(
        :unit_group,
        published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development,
        instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led,
        instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
        participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
      )
      unit1 = create(:script, name: 'unit1')
      create(:script, name: 'unit2')

      unit_group.update_scripts(['unit1', 'unit2'])
      assert_equal 2, unit_group.default_unit_group_units.length

      unit_group.update_scripts(['unit2'])

      unit_group.reload
      unit1.reload

      assert_equal 1, unit_group.default_unit_group_units.length
      assert_equal 1, unit_group.default_unit_group_units[0].position
      assert_equal 'unit2', unit_group.default_unit_group_units[0].script.name
      assert_empty unit1.unit_groups
    end

    test "remove UnitGroupUnits from original unit group" do
      original_unit_group = create(:unit_group)
      new_unit_group = create(:unit_group)
      unit1 = create(:script, name: 'unit1')
      unit2 = create(:script, name: 'unit2')

      original_unit_group.update_scripts(['unit1'])
      new_unit_group.update_scripts(['unit1', 'unit2'])

      original_unit_group.reload
      new_unit_group.reload
      unit1.reload
      unit2.reload

      assert_equal 1, original_unit_group.original_units.length
      assert_equal 1, new_unit_group.original_units.length

      original_unit_group.update_scripts([])
      original_unit_group.reload
      new_unit_group.reload
      unit1.reload
      # unit1's original unit group moved to new_unit_group
      assert_equal 0, original_unit_group.original_units.length
      assert_equal new_unit_group, unit1.original_unit_group
      assert_equal 2, new_unit_group.original_units.length

      new_unit_group.update_scripts(['unit1'])
      new_unit_group.reload
      unit2.reload
      # unit2's original unit group removed
      assert_equal 1, new_unit_group.original_units.length
      assert_equal nil, unit2.original_unit_group
    end

    test "remove UnitGroupUnits that cannot change course version from secondary unit groups" do
      course_version = create(:course_version)
      original_unit_group = create(:unit_group, course_version: course_version)
      new_unit_group = create(:unit_group)

      unit1 = create(:script, name: 'unit1')
      original_unit_group.update_scripts(['unit1'])
      new_unit_group.update_scripts(['unit1'])

      lesson = create(:lesson)
      resource = create(:resource, course_version: course_version)
      lesson.resources = [resource]
      lesson_group = create(:lesson_group, lessons: [lesson])
      unit1.lesson_groups = [lesson_group]

      original_unit_group.reload
      new_unit_group.reload
      unit1.reload

      new_unit_group.update_scripts([])
      assert_equal 0, new_unit_group.default_unit_group_units.length
    end
  end

  test "summarize" do
    unit_group = create(:unit_group, name: 'my-unit-group', family_name: 'my-family', version_year: '1999', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    CourseOffering.add_course_offering(unit_group)

    test_locale = :'te-ST'
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
            'unit1' => {
              'description' => 'unit1-description'
            }
          }
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    create(:unit_group_unit, unit_group: unit_group, position: 0, script: create(:script, name: 'unit1'))
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: 'unit2'))

    summary = unit_group.summarize(create(:teacher))

    assert_equal [:name, :id, :title, :assignment_family_title,
                  :family_name, :version_year, :published_state, :instruction_type, :instructor_audience, :participant_audience,
                  :pilot_experiment, :description_short, :description_student,
                  :description_teacher, :version_title, :scripts, :teacher_resources,
                  :student_resources, :is_migrated, :has_verified_resources, :numbered_units, :course_versions, :show_assign_button,
                  :announcements, :course_offering_id, :course_version_id, :course_path, :course_offering_edit_path], summary.keys
    assert_equal 'my-unit-group', summary[:name]
    assert_equal 'my-unit-group-title', summary[:title]
    assert_equal 'short description', summary[:description_short]
    assert_equal 'Student description here', summary[:description_student]
    assert_equal 'Teacher description here', summary[:description_teacher]
    assert_equal 'Version title', summary[:version_title]
    assert_equal 2, summary[:scripts].length
    assert_equal false, summary[:has_verified_resources]

    # spot check that we have fields that show up in Unit.summarize(false)
    assert_equal 'unit1', summary[:scripts][0][:name]
    assert_equal 'unit1-description', summary[:scripts][0][:description]

    assert_equal 1, summary[:course_versions].keys.length

    # make sure we dont have lesson info
    assert_nil summary[:scripts][0][:lessons]
  end

  test 'summarize with numbered units' do
    unit_group = create(:unit_group, name: 'my-unit-group')
    unit1 = create(:script, name: 'unit1')
    ugu1 = create(:unit_group_unit, unit_group: unit_group, position: 1, script: unit1)
    unit2 = create(:script, name: 'unit2')
    ugu2 = create(:unit_group_unit, unit_group: unit_group, position: 2, script: unit2)
    unit1.reload
    unit2.reload

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'course' => {
          'name' => {
            'my-unit-group' => {
              'title' => 'my-unit-group-title',
            }
          }
        },
        'script' => {
          'name' => {
            'unit1' => {
              'title' => 'unit1-title'
            },
            'unit2' => {
              'title' => 'unit2-title'
            }
          },
        },
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    assert_equal 'unit1-title', unit_group.summarize[:scripts].first[:title]
    assert_equal 'unit1-title', unit1.summarize[:title]

    assert_equal 'unit2-title', unit_group.summarize[:scripts].last[:title]
    assert_equal 'unit2-title', unit2.summarize[:title]

    unit_group.numbered_units = 'auto'
    unit_group.save!
    unit_group.reload

    assert_equal 'Unit 1 - unit1-title', unit_group.summarize[:scripts].first[:title]
    assert_equal 'Unit 1 - unit1-title', unit1.summarize[:title]

    assert_equal 'Unit 2 - unit2-title', unit_group.summarize[:scripts].last[:title]
    assert_equal 'Unit 2 - unit2-title', unit2.summarize[:title]

    unit_group.numbered_units = 'custom'
    unit_group.save!
    ugu1.update!(unit_prefix: '1a')
    ugu2.update!(unit_prefix: '1b')
    unit_group.reload
    unit1.reload
    unit2.reload

    assert_equal 'Unit 1a - unit1-title', unit_group.summarize[:scripts].first[:title]
    assert_equal 'Unit 1a - unit1-title', unit1.summarize[:title]

    assert_equal 'Unit 1b - unit2-title', unit_group.summarize[:scripts].last[:title]
    assert_equal 'Unit 1b - unit2-title', unit2.summarize[:title]
  end

  test 'summarize preprocesses markdown' do
    course_offering = create(:course_offering)
    course_version = create(:course_version, course_offering: course_offering)
    resource = create(:resource, course_version: course_version)
    vocab = create(:vocabulary, course_version: course_version)

    source = "We support [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource)}] resource links and [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocab)}] vocabulary definitions"
    I18n.stubs(:t).returns(source)

    expected = "We support [fake name](fake.url) resource links and <span class=\"vocab\" title=\"definition\">word</span> vocabulary definitions"
    unit_group = create(:unit_group)
    summary = unit_group.summarize

    assert_equal(expected, summary[:description_student])
    assert_equal(expected, summary[:description_teacher])
  end

  test 'summarize filters out embed_only resources' do
    embed_only_resource = create(:resource, name: 'Embed Only Resource', embeddability_type: SharedConstants::RESOURCE_EMBEDDABILITY_OPTIONS[:EMBED_ONLY][:value])
    resource_dropdown_only_resource = create(:resource, name: 'Resource Dropdown Only Resource', embeddability_type: SharedConstants::RESOURCE_EMBEDDABILITY_OPTIONS[:RESOURCE_DROPDOWN_ONLY][:value])
    course_version = create(:course_version)
    unit_group = create(:unit_group, name: 'my-unit-group', course_version: course_version, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led)
    create(:unit_group_unit, unit_group: unit_group, position: 1, script: create(:script, name: "unit1"))
    unit_group.resources = [embed_only_resource, resource_dropdown_only_resource]

    summary = unit_group.summarize
    assert_equal 1, summary[:teacher_resources].count
    assert_equal resource_dropdown_only_resource.id, summary[:teacher_resources].first[:id]
  end

  test 'summarize_course_versions' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    CourseOffering.add_course_offering(csp_2017)
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    CourseOffering.add_course_offering(csp_2018)
    csp_2019 = create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    CourseOffering.add_course_offering(csp_2019)
    csp_2020 = create(:unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
    CourseOffering.add_course_offering(csp_2020)

    [csp_2017, csp_2018, csp_2019, csp_2020].each do |c|
      summary = c.summarize_course_versions(create(:teacher))
      assert_equal(["Computer Science Principles ('17-'18)", "Computer Science Principles ('18-'19)", "Computer Science Principles ('19-'20)"], summary.values.pluck(:name))
      assert_equal([true, true, false], summary.values.pluck(:is_stable))
      assert_equal([false, true, false], summary.values.pluck(:is_recommended))
    end
  end

  test 'summarize_course_versions for student' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    CourseOffering.add_course_offering(csp_2017)
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    CourseOffering.add_course_offering(csp_2018)
    csp_2019 = create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    CourseOffering.add_course_offering(csp_2019)
    csp_2020 = create(:unit_group, name: 'csp-2020', family_name: 'csp', version_year: '2020', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
    CourseOffering.add_course_offering(csp_2020)

    [csp_2017, csp_2018, csp_2019, csp_2020].each do |c|
      summary = c.summarize_course_versions(create(:student))
      assert_equal(["Computer Science Principles ('18-'19)"], summary.values.pluck(:name))
      assert_equal([true], summary.values.pluck(:is_stable))
      assert_equal([true], summary.values.pluck(:is_recommended))
    end
  end

  class SelectCourseScriptTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)

      @unit_group = create(:unit_group, name: 'my-unit-group')

      @course_teacher = create(:teacher)
      @course_section = create(:section, user: @course_teacher, unit_group: @unit_group)
      @other_teacher = create(:teacher)
      @other_section = create(:section, user: @other_teacher)
      @student = create(:student)

      @unit1 = create(:script, name: 'unit1')
      @unit2 = create(:script, name: 'unit2')
      @unit3 = create(:script, name: 'unit3')

      create(:unit_group_unit, unit_group: @unit_group, script: @unit1, position: 1)

      @unit_group_unit = create(:unit_group_unit, unit_group: @unit_group, script: @unit2, position: 2)

      create(:unit_group_unit, unit_group: @unit_group, script: @unit3, position: 3)
    end

    test 'unit group unit test data is properly initialized' do
      assert_equal 'my-unit-group', @unit_group.name
      assert_equal %w(unit1 unit2 unit3), @unit_group.default_units.map(&:name)
    end
  end

  class RedirectCourseUrl < ActiveSupport::TestCase
    setup do
      File.stubs(:write)

      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    end

    test 'returns nil for nil user' do
      assert_nil @csp_2017.redirect_to_course_url(nil)
    end

    test 'returns nil for teacher' do
      teacher = create(:teacher)
      assert_nil @csp_2017.redirect_to_course_url(teacher)
    end

    test 'returns nil for student assigned to this unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      section = create(:section, unit_group: @csp_2017)
      student = create(:student)
      section.students << student
      assert_nil @csp_2017.redirect_to_course_url(student)
    end

    test 'returns nil for student not assigned to any unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      student = create(:student)
      assert_nil @csp_2017.redirect_to_course_url(student)
    end

    test 'returns link to latest assigned unit_group for student assigned to a unit_group in this family' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      section = create(:section, unit_group: csp_2018)
      student = create(:student)
      section.students << student
      assert_equal csp_2018.link, @csp_2017.redirect_to_course_url(student)
    end

    test 'returns nil if latest assigned unit_group is an older version than the current unit_group' do
      UnitGroup.any_instance.stubs(:can_view_version?).returns(true)
      csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      section = create(:section, unit_group: @csp_2017)
      student = create(:student)
      section.students << student
      assert_nil csp_2018.redirect_to_course_url(student)
    end
  end

  class CanViewVersion < ActiveSupport::TestCase
    setup do
      File.stubs(:write)

      @student = create(:student)
      @teacher = create(:teacher)
      @facilitator = create(:facilitator)
      @plc_reviewer = create(:plc_reviewer)

      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      @csp1_2017 = create(:script, name: 'csp1-2017', supported_locales: ['en-US', 'es-MX'])
      create(:unit_group_unit, unit_group: @csp_2017, script: @csp1_2017, position: 1)
      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      @csp1_2018 = create(:script, name: 'csp1-2018', supported_locales: ['en-US'])
      create(:unit_group_unit, unit_group: @csp_2018, script: @csp1_2018, position: 1)
      create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019')

      @pl_csp_2017 = create(:unit_group, name: 'pl-csp-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
      @pl_csp1_2017 = create(:script, name: 'pl-csp1-2017')
      create(:unit_group_unit, unit_group: @pl_csp_2017, script: @pl_csp1_2017, position: 1)
      @pl_csp_2018 = create(:unit_group, name: 'pl-csp-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
      @pl_csp_2019 = create(:unit_group, name: 'pl-csp-2019', family_name: 'pl-csp', version_year: '2019', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
    end

    test 'instructor audience can view old version' do
      assert @pl_csp_2017.can_view_version?(@plc_reviewer)
    end

    test 'teacher can always view version where they are part of the instructor audiences' do
      assert @csp_2017.can_view_version?(@teacher)
    end

    test 'teacher can not view version where they are not part of the instructor or participant audiences' do
      refute @pl_csp_2017.can_view_version?(@teacher)
    end

    test 'nil user can only view latest version in course family if its participant audience is students' do
      assert @csp_2018.can_view_version?(nil)
      refute @csp_2017.can_view_version?(nil)

      refute @pl_csp_2018.can_view_version?(nil)
      refute @pl_csp_2017.can_view_version?(nil)
    end

    test 'participant audience can view version if it is the latest version in course family' do
      assert @pl_csp_2018.can_view_version?(@facilitator)
      refute @pl_csp_2017.can_view_version?(@facilitator)
    end

    test 'student can view version if it is the latest version in course family and participant audience is student' do
      assert @csp_2018.can_view_version?(@student)
      refute @csp_2017.can_view_version?(@student)
    end

    test 'student can view version if it is the latest version in course family in their language and participant audience is student' do
      assert @csp_2017.can_view_version?(@student, 'es-MX')
      refute @csp_2017.can_view_version?(@student, 'fr-FR')
      refute @csp_2017.can_view_version?(@student, 'en-US')
    end

    test 'student can not view version if not participant audience' do
      assert @csp_2018.can_view_version?(@student)
      refute @csp_2017.can_view_version?(@student)

      refute @pl_csp_2018.can_view_version?(@student)
      refute @pl_csp_2017.can_view_version?(@student)
    end

    test 'student can view version if it is assigned to them' do
      create(:follower, section: create(:section, unit_group: @csp_2018), student_user: @student)
      create(:follower, section: create(:section, unit_group: @csp_2017), student_user: @student)

      assert @csp_2018.can_view_version?(@student)
      assert @csp_2017.can_view_version?(@student)
    end

    test 'student can view version if they have progress in it' do
      create(:user_script, user: @student, script: @csp1_2017)
      assert @csp_2017.can_view_version?(@student)
    end
  end

  class LatestVersionTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      csp1_2017 = create(:script, name: 'csp1-2017', supported_locales: ['fake-locale'])
      create(:unit_group_unit, unit_group: @csp_2017, script: csp1_2017, position: 1)
      csp2_2017 = create(:script, name: 'csp2-2017', supported_locales: ['fake-locale'])
      create(:unit_group_unit, unit_group: @csp_2017, script: csp2_2017, position: 1)

      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      csp1_2018 = create(:script, name: 'csp1-2018', supported_locales: ['fake-locale'])
      create(:unit_group_unit, unit_group: @csp_2018, script: csp1_2018, position: 1)
      csp2_2018 = create(:script, name: 'csp2-2018', supported_locales: [])
      create(:unit_group_unit, unit_group: @csp_2018, script: csp2_2018, position: 1)

      @csp_2019 = create(:unit_group, name: 'csp-2019', family_name: 'csp', version_year: '2019', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
      csp1_2019 = create(:script, name: 'csp1-2019', supported_locales: ['fake-locale'])
      create(:unit_group_unit, unit_group: @csp_2019, script: csp1_2019, position: 1)

      @student = create(:student)
    end

    test 'latest_stable_version returns nil if course family does not exist' do
      assert_nil UnitGroup.latest_stable_version('fake-family')
    end

    test 'latest_stable_version returns nil if no stable course versions support user locale' do
      assert_nil UnitGroup.latest_stable_version('csp', locale: 'invalid-locale')
    end

    test 'latest_stable_version returns the latest stable course version where each unit supports user locale' do
      assert_equal @csp_2017, UnitGroup.latest_stable_version('csp', locale: 'fake-locale')
    end

    test 'latest_stable_version returns latest stable course version for English locales' do
      assert_equal @csp_2018, UnitGroup.latest_stable_version('csp', locale: 'en-US')
    end

    test 'latest_assigned_version returns latest version in family assigned to student' do
      create(:follower, section: create(:section, unit_group: @csp_2017), student_user: @student)
      latest_assigned_version = UnitGroup.latest_assigned_version('csp', @student)
      assert_equal @csp_2017, latest_assigned_version
    end
  end

  class ProgressTests < ActiveSupport::TestCase
    setup do
      File.stubs(:write)
      @csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
      @csp1_2017 = create(:script, name: 'csp1-2017')
      @csp2_2017 = create(:script, name: 'csp2-2017')
      create(:unit_group_unit, unit_group: @csp_2017, script: @csp1_2017, position: 1)
      create(:unit_group_unit, unit_group: @csp_2017, script: @csp2_2017, position: 1)

      @csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
      @csp1_2018 = create(:script, name: 'csp1-2018')
      @csp2_2018 = create(:script, name: 'csp2-2018')
      create(:unit_group_unit, unit_group: @csp_2018, script: @csp1_2018, position: 1)
      create(:unit_group_unit, unit_group: @csp_2018, script: @csp2_2018, position: 1)

      @csd = create(:unit_group, name: 'csd')
      @csd1 = create(:script, name: 'csd1')
      create(:unit_group_unit, unit_group: @csd, script: @csd1, position: 1)

      @student = create(:student)
    end

    test 'validate test data' do
      assert_equal 2, @csp_2017.default_units.count
      assert_equal 2, @csp_2018.default_units.count
      assert_equal 1, @csd.default_units.count
    end

    test 'student with no progress has no progress' do
      refute @csp_2017.has_progress?(@student)
      refute @csp_2018.has_progress?(@student)
    end

    test 'student with progress in unit_group has progress' do
      create(:user_script, user: @student, script: @csp1_2017)

      assert @csp_2017.has_progress?(@student)
      refute @csp_2018.has_progress?(@student)
    end

    test 'student with no progress does not have older version progress' do
      refute @csp_2017.has_older_version_progress?(@student)
      refute @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in older course version has older version progress' do
      create(:user_script, user: @student, script: @csp1_2017)

      refute @csp_2017.has_older_version_progress?(@student)
      assert @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in both course versions has older version progress' do
      create(:user_script, user: @student, script: @csp1_2017)
      create(:user_script, user: @student, script: @csp2_2018)

      refute @csp_2017.has_older_version_progress?(@student)
      assert @csp_2018.has_older_version_progress?(@student)
    end

    test 'student with progress in other course family does not have older version progress' do
      create(:user_script, user: @student, script: @csd1)

      refute @csp_2017.has_older_version_progress?(@student)
      refute @csp_2018.has_older_version_progress?(@student)
    end
  end

  test 'has pilot access' do
    unit_group = create(:unit_group)
    pilot_unit_group = create(:unit_group, pilot_experiment: 'my-experiment')
    unit_in_pilot_unit_group = create(:script)
    create(:unit_group_unit, unit_group: pilot_unit_group, script: unit_in_pilot_unit_group, position: 1)

    student = create(:student)
    teacher = create(:teacher)

    pilot_teacher = create(:teacher, pilot_experiment: 'my-experiment')

    # student in a pilot teacher's section which is assigned to a pilot unit group
    pilot_section = create(:section, user: pilot_teacher, unit_group: pilot_unit_group)
    assigned_pilot_student = create(:follower, section: pilot_section).student_user

    # teacher in a pilot teacher's section, assigned to the unit group
    teacher_in_section = create(:teacher)
    create(:follower, section: pilot_section, student_user: teacher_in_section)

    # student who has progress in a pilot unit group, but is not currently assigned to it
    other_section = create(:section, user: pilot_teacher, unit_group: pilot_unit_group)
    pilot_student_with_progress = create(:student)
    create(:follower, section: other_section, student_user: pilot_student_with_progress)
    create(:user_script, user: pilot_student_with_progress, script: unit_in_pilot_unit_group)

    # student of pilot teacher, without assignment or progress
    non_pilot_section = create(:section, user: pilot_teacher)
    student_of_pilot_teacher = create(:follower, section: non_pilot_section).student_user

    levelbuilder = create(:levelbuilder)

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
    student = create(:student)
    teacher = create(:teacher)
    pilot_teacher = create(:teacher, pilot_experiment: 'my-experiment')
    create(:unit_group, pilot_experiment: 'my-experiment')
    levelbuilder = create(:levelbuilder)

    refute UnitGroup.has_any_pilot_access?
    refute UnitGroup.has_any_pilot_access?(student)
    refute UnitGroup.has_any_pilot_access?(teacher)
    assert UnitGroup.has_any_pilot_access?(pilot_teacher)
    assert UnitGroup.has_any_pilot_access?(levelbuilder)
  end

  test 'units_for_user' do
    teacher = create(:teacher)
    levelbuilder = create(:levelbuilder)

    csx = create(:unit_group, name: 'csx-2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    csx1 = create(:script, name: 'csx1')
    csx2 = create(:script, name: 'csx2')
    csx3 = create(:script, name: 'csx3')

    create(:unit_group_unit, position: 1, unit_group: csx, script: csx1)
    create(:unit_group_unit, position: 2, unit_group: csx, script: csx2)
    create(:unit_group_unit, position: 3, unit_group: csx, script: csx3)

    assert_equal ['csx1', 'csx2', 'csx3'], csx.units_for_user(nil).map(&:name)
    assert_equal ['csx1', 'csx2', 'csx3'], csx.units_for_user(teacher).map(&:name)
    assert_equal ['csx1', 'csx2', 'csx3'], csx.units_for_user(levelbuilder).map(&:name)

    csx1.update!(hide_within_course: true)
    csx.reload

    assert_equal ['csx2', 'csx3'], csx.units_for_user(nil).map(&:name)
    assert_equal ['csx2', 'csx3'], csx.units_for_user(teacher).map(&:name)
    assert_equal ['csx1', 'csx2', 'csx3'], csx.units_for_user(levelbuilder).map(&:name)
  end

  test 'load_from_path does not write course json file' do
    unit_group_name = 'test-course-offering'
    refute UnitGroup.find_by_name(unit_group_name)

    File.stubs(:write).raises('must not modify filesystem')

    filepath = "#{Rails.root}/test/fixtures/#{unit_group_name}.course"
    UnitGroup.load_from_path(filepath)
    assert UnitGroup.find_by_name(unit_group_name)
  end

  test 'supported_locale_codes' do
    csx = create(:unit_group, name: 'csx-2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    csx1 = create(:script, name: 'csx1', supported_locales: ['it-IT', 'en-GB', 'zh-TW', 'tlh'])
    csx2 = create(:script, name: 'csx2', supported_locales: ['it-IT', 'tlh', 'zh-TW', 'es-MX'])
    csx3 = create(:script, name: 'csx3', supported_locales: ['it-IT', 'en-GB', 'zh-TW'])

    create(:unit_group_unit, position: 1, unit_group: csx, script: csx1)
    create(:unit_group_unit, position: 2, unit_group: csx, script: csx2)
    create(:unit_group_unit, position: 3, unit_group: csx, script: csx3)

    assert_equal ['en-US', 'it-IT', 'zh-TW'], csx.supported_locale_codes
  end

  test 'single_unit_course' do
    single_unit_course = create(:single_unit_course)

    multi_unit_course = create(:unit_group, name: 'multi-unit-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    multi_unit1 = create(:script, name: 'multi-unit1')
    multi_unit2 = create(:script, name: 'multi-unit2')
    create(:unit_group_unit, unit_group: multi_unit_course, script: multi_unit1, position: 1)
    create(:unit_group_unit, unit_group: multi_unit_course, script: multi_unit2, position: 2)

    assert single_unit_course.single_unit_course?
    refute multi_unit_course.single_unit_course?
  end

  test 'first_unit' do
    single_unit_course = create(:single_unit_course)

    multi_unit_course = create(:unit_group, name: 'multi-unit-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    multi_unit1 = create(:script, name: 'multi-unit1')
    multi_unit2 = create(:script, name: 'multi-unit2')
    create(:unit_group_unit, unit_group: multi_unit_course, script: multi_unit1, position: 1)
    create(:unit_group_unit, unit_group: multi_unit_course, script: multi_unit2, position: 2)

    assert_equal single_unit_course.default_units.first, single_unit_course.first_unit
    assert_equal multi_unit_course.default_units.first, multi_unit_course.first_unit
  end
end
