require 'test_helper'

class ReferenceGuideTest < ActiveSupport::TestCase
  test "can create reference guide" do
    reference_guide = create :reference_guide
    assert reference_guide.id
  end

  test "reference guides are unique by key in course version" do
    create :reference_guide, key: 'page', course_version_id: 1
    create :reference_guide, key: 'page', course_version_id: 2
    assert_raises ActiveRecord::RecordInvalid do
      create :reference_guide, key: 'page', course_version_id: 1
    end
  end

  test "reference guides seed from files correctly" do
    co = create :course_offering, key: 'csp'
    cv = create :course_version, key: '2022', course_offering: co
    guide = create :reference_guide, id: '1', display_name: 'Hello World', key: 'page', content: 'page content', course_version: cv, position: 2
    serialization = guide.serialize
    previous_guide = guide.freeze
    guide.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_guide_id = ReferenceGuide.seed_record("config/reference_guides/csp_2022/page.json")
    new_guide = ReferenceGuide.find_by(id: new_guide_id)
    assert_equal previous_guide.attributes.except('id', 'created_at', 'updated_at'),
      new_guide.attributes.except('id', 'created_at', 'updated_at')
  end

  test "reference guides can be nested" do
    guide = create :reference_guide, key: 'page', course_version_id: 1, parent_reference_guide_key: 'category_page'
    category = create :reference_guide, key: 'category_page', course_version_id: 1
    assert_equal [guide], category.children
  end
end
