require 'test_helper'
require 'cdo/aws/s3'

# Every key in standalone_projects.yml names a level that
# ProjectsController finds by name on each /projects/<key> request. The levels
# come from seed:standalone_project_levels, which seed:test runs, so these
# tests see what every environment seeds rather than a factory stand-in.
class StandaloneProjectLevelsTest < ActionDispatch::IntegrationTest
  PROJECT_EDIT_PATH = %r{\A/projects/(?<key>\w+)/(?<channel_id>[^/]+)/edit\z}

  setup do
    AWS::S3.stubs :create_client
    # Satisfies login_required and levelbuilder_required alike.
    sign_in create(:levelbuilder)
  end

  Policies::StandaloneProjects.all.each do |key, config|
    test "/projects/#{key} serves a new #{config[:name]} project" do
      level = Level.find_by_key(config[:name])
      refute_nil level, <<~MESSAGE
        #{config[:name].dump} was not seeded. If you created this level, check that
        standalone_projects.yml names it exactly. Then reseed the test database
        from dashboard/ with one of:
          RAILS_ENV=test bundle exec rake seed:standalone_project_levels
          RAILS_ENV=test bundle exec rake db:reset db:test:prepare
      MESSAGE
      refute_nil level.game, "#{config[:name].dump} has no game"
      # Without it the page never hands a Lab2 lab its project channel.
      assert level.try(:is_project_level),
        "#{config[:name].dump} does not set is_project_level: \"is_project_level\": true in a .level file, `standalone` in a BubbleChoice DSL"

      get "/projects/#{key}/new"
      channel_id = assert_redirected_to_edit(key)
      follow_redirect!
      assert_response :success

      get "/projects/#{key}"
      assert_equal channel_id, assert_redirected_to_edit(key), 'load should reopen the most recent project'
    end
  end

  private def assert_redirected_to_edit(key)
    assert_response :redirect, response.body
    path = URI(response.headers['Location']).path
    match = PROJECT_EDIT_PATH.match(path)
    refute_nil match, "expected a redirect to the project editor, got #{path}"
    assert_equal key.to_s, match[:key]
    match[:channel_id]
  end
end
