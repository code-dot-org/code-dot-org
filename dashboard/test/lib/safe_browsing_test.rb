require 'test_helper'

class SafeBrowsingTest < ActiveSupport::TestCase
  def test_determine_safe_website
    assert SafeBrowsing.determine_safe_to_open("https://code.org/")
  end

  def test_determine_unsafe_website
    refute SafeBrowsing.determine_safe_to_open("http://testsafebrowsing.appspot.com/s/phishing.html")
  end
end
