require 'test_helper'

class MusiclabControllerTest < ActionController::TestCase
  setup do
    published_musiclab_featured_project = {
      "channel" => "abc123",
      "name" => "featured-music-1",
      "thumbnailUrl" => nil,
      "type" => "music",
      "publishedAt" => "2024-05-21 20:25:22 +0000",
      "studentName" => "A",
      "studentAgeRange" => "18+",
      "isFeatured" => true,
      "featuredAt" => "2024-06-04 22:04:50 +0000"
    }
    music_lab_project = {
      "name" => "featured-music-1",
      "id" => "123",
      "labConfig" => {}
    }
    ProjectsList.stubs(:fetch_active_published_featured_projects).returns({"music" => [published_musiclab_featured_project]})
    @controller.stubs(:get_musiclab_projects).returns([published_musiclab_featured_project])
    @controller.stubs(:get_project_details).returns([music_lab_project])
  end

  test_user_gets_response_for(
    :embed,
    name: 'anonymous user can list all featured music projects',
  )
end
