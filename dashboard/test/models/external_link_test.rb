require 'test_helper'

class ExternalLinkTest < ActiveSupport::TestCase
  test 'prepend urls' do
    external_link_level = create(:external_link, url: 'www.cnn.com')
    assert_equal 'http://www.cnn.com', external_link_level.url

    external_link_level = create(:external_link, url: 'http://www.cnn.com')
    assert_equal 'http://www.cnn.com', external_link_level.url

    external_link_level = create(:external_link, url: 'https://www.cnn.com')
    assert_equal 'https://www.cnn.com', external_link_level.url

    assert_raises do
      create(:external_link, url: nil)
    end

    assert_raises do
      create(:external_link, url: 'www.cnn.com', link_title: nil)
    end

    assert_raises do
      create(:external_link, url: 'www.cnn.com', link_title: 'title', name: nil)
    end
  end
end
