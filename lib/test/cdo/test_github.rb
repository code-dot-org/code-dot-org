require_relative '../test_helper'
require 'uri'
require 'cdo/github'

class GitHubTest < Minitest::Test
  TEST_REPO = "my-org/my-repo"

  def setup
    # Override the REPO constant to ensure it's being used in tested methods
    GitHub.send(:remove_const, :REPO) if GitHub.const_defined?(:REPO)
    GitHub.const_set(:REPO, TEST_REPO)
  end

  # Verify that the given URL is a valid URL for github.com
  def assert_valid_github_url(url)
    uri = URI.parse(url)
    assert_equal "https", uri.scheme, "Expected HTTPS URL, got #{url}"
    assert_equal "github.com", uri.host, "Expected a GitHub URL, got #{url}"
  rescue URI::InvalidURIError
    flunk "Expected a valid URL, got #{url}"
  end

  def test_pr_url_returns_valid_github_url
    url = GitHub.pr_url(123)
    assert_valid_github_url(url)
    assert_equal "https://github.com/#{TEST_REPO}/pull/123", url
  end

  def test_commit_url_returns_valid_github_url
    url = GitHub.commit_url("abc123")
    assert_valid_github_url(url)
    assert_equal "https://github.com/#{TEST_REPO}/commit/abc123", url
  end
end
