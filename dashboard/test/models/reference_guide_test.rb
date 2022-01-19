require 'test_helper'

class ReferenceGuideTest < ActiveSupport::TestCase
  test "can create reference guide" do
    reference_guide = create :reference_guide
    assert reference_guide.id
  end

  test "reference guides are unique by slug in course version" do
    create :reference_guide, slug: 'hello/world', course_version_id: 1
    create :reference_guide, slug: 'hello/world', course_version_id: 2
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, slug: 'hello/world', course_version_id: 1
    end
  end

  test "serialization creates files correctly" do
    reference_guide = create :reference_guide
    reference_guide.write_serialization
  end

  test "reference guides seed from files correctly" do
    guide = create :reference_guide, id: '1', name: 'World', slug: 'hello/world', content: 'hello world', course_version_id: 3, order: 2
    serialization = guide.serialize
    previous_guide = guide.freeze
    guide.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_guide_id = ReferenceGuide.seed_record("config/reference_guides/hello/world.json")
    new_guide = ReferenceGuide.find_by(id: new_guide_id)
    assert_equal previous_guide.attributes.except('id', 'created_at', 'updated_at'),
      new_guide.attributes.except('id', 'created_at', 'updated_at')
  end
end
