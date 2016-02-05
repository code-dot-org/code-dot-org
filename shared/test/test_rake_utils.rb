require_relative 'test_helper'
require 'cdo/rake_utils'
require 'webmock/minitest'

class RakeUtilsTest < Minitest::Test
  include SetupTest

  def test_github_latest_commit_hash
    dir = __dir__
    commit_hash = RakeUtils.git_latest_commit_hash(dir)
    stub_request(:get, /api.github.com\/repos\/code-dot-org\/code-dot-org/).to_return(body: [{sha: commit_hash}].to_json)
    assert_equal commit_hash, RakeUtils.github_latest_commit_hash(dir)
  end
end
