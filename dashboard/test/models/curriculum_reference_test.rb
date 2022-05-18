require 'test_helper'

class CurriculumReferenceTest < ActiveSupport::TestCase
  test 'basic level creation' do
    level = create(:curriculum_reference, reference: '/docs/csd/maker_leds/index.html')
    assert_equal '/docs/csd/maker_leds/index.html', level.reference
    assert_equal '/docs/csd/maker_leds/index.html', level.href
  end

  test 'knows it is a reference guide' do
    unit_group = create :unit_group, family_name: 'bogus-course', version_year: '2022', name: 'bogus-course-2022'
    CourseOffering.add_course_offering(unit_group)
    ref_guide = create :reference_guide, key: 'key', course_version: unit_group.course_version
    level = create(:curriculum_reference, reference: "/courses/#{ref_guide.course_offering_version}/guides/#{ref_guide.key}")
    assert level.reference_guide_level?
    assert_equal ref_guide, level.reference_guide
  end
end
