require 'test_helper'

class AnnouncementsTest < ActiveSupport::TestCase
  setup do
    Announcements.set_file_path(File.join("#{dashboard_dir}/test/lib", 'announcements_test_data.json'))
  end

  test 'gets courses announcement' do
    announcement = Announcements.get_announcement_for_page("/courses")
    assert announcement
    assert_equal("https://code.org/images/professional-learning-2019-3.png", announcement[:image])
    assert_equal("Join our hands-on workshops!", announcement[:body])
    assert_equal("Sign up for Professional Learning", announcement[:title])
    assert_equal("Join us", announcement[:buttonText])
    assert_equal("https://code.org/educate/professional-learning/middle-high", announcement[:buttonUrl])
    assert_equal("teacher-apps-open-2021-sign-up", announcement[:buttonId])
  end

  test 'gets home announcement' do
    announcement = Announcements.get_announcement_for_page("/home")
    assert announcement
    assert_equal("https://code.org/images/professional-learning-2019-closing-soon.png", announcement[:image])
    assert_equal("Join us in this movement and submit your application today.", announcement[:body])
    assert_equal("Don’t miss out. Apply today!", announcement[:title])
    assert_equal("Join us", announcement[:buttonText])
    assert_equal("https://code.org/educate/professional-learning/middle-high", announcement[:buttonUrl])
    assert_equal("teacher-apps-closing-2020-sign-up", announcement[:buttonId])
    assert_equal("Join us 2!", announcement[:buttonText2])
    assert_equal("https://code.org/educate/professional-learning", announcement[:buttonUrl2])
    assert_equal("teacher-apps-closing-2020-sign-up-2", announcement[:buttonId2])
  end

  test 'returns nil for invalid banner id' do
    announcement = Announcements.get_announcement_for_page("/another-page")
    assert_nil announcement
  end

  test 'returns nil for page not found' do
    announcement = Announcements.get_announcement_for_page("/not-a-page")
    assert_nil announcement
  end

  test 'quietly reject invalid data' do
    incomplete_banner_data = {
      pages: {
        "/courses": "test"
      },
      banners: {
        test: {
          image: "sample_image"
        }
      }
    }
    refute Announcements.validate_announcements_data(incomplete_banner_data)
  end

  test 'quietly reject empty data' do
    empty_data = {}
    refute Announcements.validate_announcements_data(empty_data)
  end

  test 'quietly ignore invalid json' do
    Announcements.set_file_path(File.join("#{dashboard_dir}/test/lib", 'announcements_invalid_data.json'))
    announcement = Announcements.get_announcement_for_page("/courses")
    refute announcement
  end

  test 'quietly ignore missing file' do
    Announcements.set_file_path(File.join("#{dashboard_dir}/test/lib", 'not-a-file.json'))
    announcement = Announcements.get_announcement_for_page("/courses")
    refute announcement
  end
end
