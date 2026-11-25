require 'test_helper'
require 'cdo/aws/s3'
require 'cdo/test_run_utils'

# Every key in standalone_projects.yml names a level that
# ProjectsController finds by name on each /projects/<key> request. The levels
# come from seed:standalone_project_levels, which seed:test runs, so these
# tests see what every environment seeds rather than a factory stand-in.
class StandaloneProjectLevelsTest < ActionDispatch::IntegrationTest
  PROJECT_EDIT_PATH = %r{\A/projects/(?<key>\w+)/[^/]+/edit\z}

  setup do
    AWS::S3.stubs :create_client
    # Satisfies login_required and levelbuilder_required alike.
    sign_in create(:levelbuilder)
  end

  Policies::StandaloneProjects.all.each do |key, config|
    test "/projects/#{key}/new serves a new #{config[:name]} project" do
      assert self.class.defined_level_names.include?(config[:name]), <<~MESSAGE
        standalone_projects.yml names #{config[:name].dump}, but no file under
        config/standalone_projects defines a level by that name. If you
        created this level, check that the level file was added and that
        standalone_projects.yml names it exactly.
      MESSAGE
      level = Level.find_by_key(config[:name])
      refute_nil level, <<~MESSAGE + reseed_advice
        #{config[:name].dump} has a level file but is not in the test database.
      MESSAGE
      refute_nil level.game, "#{config[:name].dump} has no game"
      # Without it the page never hands a Lab2 lab its project channel.
      assert level.try(:is_project_level),
        "#{config[:name].dump} does not set is_project_level: \"is_project_level\": true in a .level file, `standalone` in a BubbleChoice DSL"

      get "/projects/#{key}/new"
      assert_redirected_to_edit(key)
      follow_redirect!
      assert_response :success
    end
  end

  # Every level a file under config/standalone_projects defines. A .level file
  # is named after its level; a DSL file names its level on its name line.
  def self.defined_level_names
    @defined_level_names ||= begin
      level_files = Dir.glob(Policies::LevelFiles.level_file_glob(nil, Rails.root, partition: :standalone_projects))
      dsl_files = Dir.glob(Rails.root.join('config/standalone_projects/scripts/**/*')).select {|path| File.file?(path)}
      names = level_files.map {|path| Policies::LevelFiles.level_name_from_path(path)}
      names.concat(dsl_files.filter_map {|path| File.read(path)[/^name ['"](.+)['"]\s*$/, 1]})
      names.to_set
    end
  end

  # On the chef-managed test machine each build reloads the test databases
  # from the seed cache, so a reseed by hand does not last.
  private def reseed_advice
    if CDO.test_system?
      <<~MESSAGE
        The build on this machine loads the test databases from a seed cache,
        which may be stale. Delete it so that the next build reseeds:
          aws s3 rm s3://#{TestRunUtils::DASHBOARD_SEED_BUCKET}/#{TestRunUtils.dashboard_seed_s3_key}
      MESSAGE
    elsif CI::Utils.running_on_ci?
      # CI seeds a new database from this tree on every run.
      ''
    else
      <<~MESSAGE
        You may not have seeded since the file was added. Reseed from
        dashboard/ with one of:
          RAILS_ENV=test bundle exec rake seed:standalone_project_levels
          RAILS_ENV=test bundle exec rake db:reset db:test:prepare
      MESSAGE
    end
  end

  private def assert_redirected_to_edit(key)
    assert_response :redirect, response.body
    path = URI(response.headers['Location']).path
    match = PROJECT_EDIT_PATH.match(path)
    refute_nil match, "expected a redirect to the project editor, got #{path}"
    assert_equal key.to_s, match[:key]
  end
end
