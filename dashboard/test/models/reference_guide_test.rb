require 'test_helper'

class ReferenceGuideTest < ActiveSupport::TestCase
  test "can create reference guide" do
    reference_guide = create :reference_guide
    assert reference_guide.id
  end

  test "reference guides are unique by slug in course version" do
    create :reference_guide, key: 'hello/world', course_version_id: 1
    create :reference_guide, key: 'hello/world', course_version_id: 2
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: 'hello/world', course_version_id: 1
    end
  end

  test "reference guides seed from files correctly" do
    co = create :course_offering, key: 'course'
    cv = create :course_version, key: 'version', course_offering: co
    guide = create :reference_guide, id: '1', display_name: 'World', key: 'hello/world', content: 'hello world', course_version_id: cv.id, position: 2
    serialization = guide.serialize
    previous_guide = guide.freeze
    guide.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_guide_id = ReferenceGuide.seed_record("config/reference_guides/course_version/hello/world.json")
    new_guide = ReferenceGuide.find_by(id: new_guide_id)
    assert_equal previous_guide.attributes.except('id', 'created_at', 'updated_at'),
      new_guide.attributes.except('id', 'created_at', 'updated_at')
  end
end
