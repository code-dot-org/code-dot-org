require 'test_helper'

class VideoTest < ActiveSupport::TestCase
  test "check_i18n_names" do
    # does not raise exception ..
    Video.check_i18n_names

    Video.create!(key: 'no_i18n_yet', download: 'no_download_link')

    # .. until we create a video without adding its name to the i18n file
    assert_raises(RuntimeError) do
      Video.check_i18n_names
    end
  end
end
