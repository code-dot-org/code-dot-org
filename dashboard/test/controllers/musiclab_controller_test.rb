require 'test_helper'

class MusiclabControllerTest < ActionController::TestCase
  setup do
    published_musiclab_featured_project = {
      "channel" => "abc123",
      name: "featured-music-1",
      thumbnailUrl: nil,
      type: "music",
      publishedAt: "2024-05-21 20:25:22 +0000",
      studentName: "A",
      studentAgeRange: "18+",
      isFeatured: true,
      featuredAt: "2024-06-04 22:04:50 +0000"
    }
    ProjectsList.stubs(:fetch_active_published_featured_projects).returns({"music" => [published_musiclab_featured_project]})
    @controller.stubs(:get_musiclab_projects).returns([published_musiclab_featured_project])
  end
  test 'When channels param is included, use specified channel id' do
    channels_param = 'xyz321'
    assert_equal ['xyz321'], @controller.send(:get_selected_channel_ids, channels_param)
  end
  test  'When channels param is not included, use channel ids from featured projects' do
    DCDO.stubs(:get).with('get_channel_ids_from_featured_projects_gallery', true).returns(true)
    assert_equal ['abc123'], @controller.send(:get_selected_channel_ids)
  end
  test 'When DCDO flag is set to `false` get_channel_ids_from_featured_projects_gallery returns false' do
    DCDO.stubs(:get).with('get_channel_ids_from_featured_projects_gallery', true).returns(false)
    assert_equal false, @controller.send(:get_channel_ids_from_featured_projects_gallery?)
  end
  test_user_gets_response_for(
    :embed,
    name: 'anonymous user can list all featured music projects',
  )
end
