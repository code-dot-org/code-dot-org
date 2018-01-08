require 'test_helper'

class CurriculumReferenceTest < ActiveSupport::TestCase
  test 'basic level creation' do
    level = create(:curriculum_reference, reference: '/docs/csd/maker_leds/index.html')
    assert_equal '/docs/csd/maker_leds/index.html', level.reference
    assert_equal '/docs/csd/maker_leds/index.html', level.href
  end
end
