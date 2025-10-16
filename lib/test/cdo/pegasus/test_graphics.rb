require_relative '../../test_helper'
require 'cdo/pegasus/graphics'

class GraphicsTest < Minitest::Test
  # Image modification should return consistent results, since we will do
  # things like generate cache keys from modified images.
  #
  # See https://github.com/code-dot-org/code-dot-org/pull/67092
  def test_consistency
    test_image = deploy_dir('shared/images/courses/logo_artist.png')
    first_load = load_manipulated_image(test_image, :fill, 70, 70).to_blob

    # Let some time pass to validate that we don't get any inconsistency from
    # included "Modify Date" metadata. We need to use sleep here because the
    # underlying image libraries don't respect Timecop.
    sleep 1

    second_load = load_manipulated_image(test_image, :fill, 70, 70).to_blob
    assert_equal first_load, second_load
  end
end
