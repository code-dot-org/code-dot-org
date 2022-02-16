require 'test_helper'

class ReferenceGuideTest < ActiveSupport::TestCase
  test "can create reference guide" do
    reference_guide = create :reference_guide
    assert reference_guide.id
  end

  test "do not allow invalid keys" do
    create :reference_guide, key: 'valid.KEY_'
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: 'fgsfds.'
    end
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: '.fgsfds'
    end
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: '\\ $ % * & @'
    end
  end

  test "reference guides are unique by key in course version" do
    ref1 = create :reference_guide, key: 'page'
    create :reference_guide, key: 'page'
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: 'page', course_version_id: ref1.course_version_id
    end
  end

  test "reference guides seed from files correctly" do
    co = create :course_offering, key: 'test-offering'
    cv = create :course_version, key: '20xx', course_offering: co
    guide = create :reference_guide, display_name: 'Test Serialization', key: 'test-serialization', content: 'There is some content here that is being serialized.\r\n', course_version: cv, position: 0
    serialization = guide.serialize
    previous_guide = guide.freeze
    guide.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_guide_id = ReferenceGuide.seed_record("test/fixtures/config/reference_guides/test-reference-guide.json")
    new_guide = ReferenceGuide.find_by(id: new_guide_id)
    assert_equal previous_guide.attributes.except('id', 'created_at', 'updated_at'),
      new_guide.attributes.except('id', 'created_at', 'updated_at')
  end

  test "reference guides can be nested" do
    guide = create :reference_guide, key: 'page', parent_reference_guide_key: 'category_page'
    category = create :reference_guide, key: 'category_page', course_version_id: guide.course_version_id
    assert_equal [guide], category.children
  end
end
