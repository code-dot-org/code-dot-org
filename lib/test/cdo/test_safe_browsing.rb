require_relative '../test_helper'
require_relative '../../cdo/safe_browsing'
require 'webmock/minitest'

class SafeBrowsingTest < Minitest::Test
  include SetupTest

  def setup
    CDO.stubs(google_safe_browsing_key: 'mockkey')
  end

  # Do additional VCR configuration so as to prevent the CDO.google_safe_browsing_key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<SAFE_BROWSE_API_KEY>') {CDO.google_safe_browsing_key}
  end

  def test_determine_safe_website
    assert SafeBrowsing.determine_safe_to_open("https://code.org/")
  end

  def test_determine_unsafe_website
    refute SafeBrowsing.determine_safe_to_open("http://testsafebrowsing.appspot.com/s/phishing.html")
  end

  def test_safe_with_bad_request
    stub_request(:post,     "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + CDO.google_safe_browsing_key).
      to_return({status: 400, body: "{}", headers: {}})
    assert SafeBrowsing.determine_safe_to_open("http://testsafebrowsing.appspot.com/s/phishing.html")
  end

  def test_safe_with_rate_limit
    stub_request(:post,     "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + CDO.google_safe_browsing_key).
      to_return({status: 429, body: "{}", headers: {}})
    assert SafeBrowsing.determine_safe_to_open("http://testsafebrowsing.appspot.com/s/phishing.html")
  end
end
