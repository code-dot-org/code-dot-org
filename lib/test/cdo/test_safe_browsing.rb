require_relative '../../../shared/test/test_helper'
require_relative '../../cdo/safe_browsing'

class SafeBrowsingTest < Minitest::Test
  include SetupTest

  # Do additional VCR configuration so as to prevent the CDO.google_safe_browsing_key from being logged to the
  # YML cassette, instead replacing it with a placeholder string.
  VCR.configure do |c|
    c.filter_sensitive_data('<API_KEY>') {CDO.google_safe_browsing_key}
  end

  def test_determine_safe_website
    assert SafeBrowsing.determine_safe_to_open("https://code.org/")
  end

  def test_determine_unsafe_website
    refute SafeBrowsing.determine_safe_to_open("http://testsafebrowsing.appspot.com/s/phishing.html")
  end
end
