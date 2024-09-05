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
    assert_equal("teacher-apps-open-2021", announcement[:id])
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
    assert_equal("teacher-apps-closing-2020", announcement[:id])
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
        '/courses': "test"
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

  test 'returns nil for announcement behind false dcdo flag' do
    DCDO.stubs(:get).with('announcement-dcdo-test', false).returns(false)
    announcement = Announcements.get_announcement_for_page("/dcdo-test")
    assert_nil announcement
    DCDO.unstub(:get)
  end

  test 'gets announcement for banner behind true dcdo flag' do
    DCDO.stubs(:get).with('announcement-dcdo-test', false).returns(true)
    announcement = Announcements.get_announcement_for_page("/dcdo-test")
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
    assert_equal("dcdo-flag-test", announcement[:id])
    DCDO.unstub(:get)
  end

  test 'gets announcement for banner behind hoc mode soon hoc flag' do
    DCDO.stubs(:get).with('hoc_mode', false).returns('soon-hoc')
    announcement = Announcements.get_announcement_for_page("/hoc-modes-test")
    assert announcement
    assert_equal("https://code.org/shared/images/social-media/hoc2023_social.png", announcement[:image])
    assert_equal("Register your Hour of Code", announcement[:title])
    assert_equal("Join us December 9th-15th for CSEdWeek and help us bring what students love to life!", announcement[:body])
    assert_equal("Host an event", announcement[:buttonText])
    assert_equal("https://hourofcode.com/events", announcement[:buttonUrl])
    assert_equal("host-an-event", announcement[:buttonId])
    assert_equal("hoc-modes-test", announcement[:id])
    DCDO.unstub(:get)
  end
end
