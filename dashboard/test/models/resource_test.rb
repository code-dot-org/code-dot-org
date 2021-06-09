require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  test "can create resource" do
    resource = create :resource, key: 'my_key'
    assert_equal 'my_key', resource.key
  end

  test "resource can be in multiple lessons" do
    resource = create :resource
    lesson1 = create :lesson
    lesson1.resources.push(resource)
    lesson2 = create :lesson
    lesson2.resources.push(resource)
    assert_equal [lesson1, lesson2], resource.lessons
  end

  test "multiple resources can be in a lesson" do
    lesson = create :lesson
    resource1 = create :resource, lessons: [lesson]
    resource2 = create :resource, lessons: [lesson]
    assert_equal [resource1, resource2], lesson.resources
  end

  test "can generate key from name" do
    resource = create :resource, key: nil, name: 'name to make into a key'
    assert_equal 'name_to_make_into_a_key', resource.key
    assert resource.valid?
  end

  test "can generate different keys for resources with the same name" do
    course_version = create :course_version
    resource1 = create :resource, key: nil, name: 'duplicate name', course_version: course_version
    assert_equal 'duplicate_name', resource1.key
    resource2 = create :resource, key: nil, name: 'duplicate name', course_version: course_version
    assert_equal 'duplicate_name_1', resource2.key
  end

  test "resources in different course versions can have the same key" do
    course_version1 = create :course_version
    course_version2 = create :course_version
    resource1 = create :resource, key: nil, name: 'duplicate name', course_version: course_version1
    resource2 = create :resource, key: nil, name: 'duplicate name', course_version: course_version2
    assert_equal 'duplicate_name', resource1.key
    assert_equal 'duplicate_name', resource2.key
  end

  test "resource names with special characters still work" do
    resource = create :resource, key: nil, name: "my students' projects @ code.org"
    assert_equal 'my_students_projects_code_org', resource.key
  end

  test "resource downcases and strips whitespace for key generation" do
    resource = create :resource, key: nil, name: "   Plotting Shapes "
    assert_equal 'plotting_shapes', resource.key
  end

  test "resource enforces key format" do
    resource = create :resource
    assert resource.valid?

    resource.update(key: "Key with invalid characters")
    refute resource.valid?
    assert_equal [{error: :invalid, value: "Key with invalid characters"}],
      resource.errors.details[:key]

    resource.update(key: "abcdefghijklmnopqrstuvwxyz1234567890-_")
    assert resource.valid?
  end

  test "summarize for lesson plan" do
    resource = create :resource, key: 'my_key', name: 'test resource', url: 'test.url',  audience: 'Teacher', type: 'Activity Guide'
    assert_equal(
      {id: resource.id, key: 'my_key', name: 'test resource', url: 'test.url', download_url: nil, audience: 'Teacher', type: 'Activity Guide'},
      resource.summarize_for_lesson_plan
    )
  end

  test "'resources dropdown' summary method includes markdown key" do
    # This is necessary for the "add markdown syntax" levelbuilder interface to work
    course_offering = create :course_offering
    course_version = create(:course_version, course_offering: course_offering)
    resource = create(:resource, course_version: course_version)
    summary = resource.summarize_for_resources_dropdown
    assert summary.key?(:markdownKey)
    assert_equal(
      Services::GloballyUniqueIdentifiers.build_resource_key(resource),
      summary[:markdownKey]
    )
  end

  test 'seeding_key' do
    resource = create :resource
    seed_context = {}

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'resource.key' => resource.key,
      }
      assert_equal expected, resource.seeding_key(seed_context)
    end
  end

  test 'should_include_in_pdf' do
    assert create(:resource, include_in_pdf: true, audience: 'Teacher').should_include_in_pdf?
    refute create(:resource, include_in_pdf: false, audience: 'Teacher').should_include_in_pdf?
    refute create(:resource, include_in_pdf: true, audience: 'Verified Teacher').should_include_in_pdf?
    refute create(:resource, include_in_pdf: false, audience: 'Verified Teacher').should_include_in_pdf?
  end

  test 'serialize scripts that resource is in' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder

    course_version = create :course_version, :with_unit_group
    unit_group = course_version.content_root
    script1 = create :script
    script2 = create :script
    script1.expects(:write_script_json).once
    script2.expects(:write_script_json).once
    create :unit_group_unit, unit_group: unit_group, script: script1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: script2, position: 2
    lesson1 = create :lesson, script: script1
    lesson2 = create :lesson, script: script2
    resource = create :resource, course_version: course_version
    resource.lessons = [lesson1, lesson2]
    resource.serialize_scripts
  end
end
