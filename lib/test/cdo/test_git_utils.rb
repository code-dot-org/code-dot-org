require_relative '../test_helper'
require 'cdo/git_utils'
require 'cdo/rake_utils'

DASHBOARD_MATCH_GLOBS = ['dashboard/**/*', 'lib/**/*', 'shared/**/*'].freeze
DASHBOARD_IGNORE_GLOBS = ['dashboard/test/ui/**/*'].freeze

class GitUtilsTest < Minitest::Test
  def test_dashboard_globs
    files = GitUtils.files_matching_globs(
      ['dashboard/app/models/foo.rb'],
      DASHBOARD_MATCH_GLOBS,
      ignore_patterns: DASHBOARD_IGNORE_GLOBS
    )
    assert_equal 1, files.length, 'matches files in dashboard/app'

    files = GitUtils.files_matching_globs(
      ['dashboard/test/controllers/bar_test.rb'],
      DASHBOARD_MATCH_GLOBS,
      ignore_patterns: DASHBOARD_IGNORE_GLOBS
    )
    assert_equal 1, files.length, 'matches files in dashboard/test/controllers'

    files = GitUtils.files_matching_globs(
      [
        'dashboard/test/ui/features/baz.feature',
        'dashboard/test/ui/step_definitions/steps.rb'
      ],
      DASHBOARD_MATCH_GLOBS,
      ignore_patterns: DASHBOARD_IGNORE_GLOBS
    )
    assert_equal 0, files.length, 'ignores files in dashboard/test/ui'
  end

  def test_current_branch_merged_into
    GitUtils.stubs(:current_branch).returns("current_branch")
    GitUtils.stubs(:merged_branches).returns(
      %w(
        staging
        some_other_branch
      )
    )
    refute GitUtils.current_branch_merged_into?("staging")
    GitUtils.stubs(:merged_branches).returns(
      %w(
        staging
        current_branch
        some_other_branch
      )
    )
    assert GitUtils.current_branch_merged_into?("staging")
  end
end
