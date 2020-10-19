require_relative 'test_helper'
require 'cdo'

class CdoTest < Minitest::Test
  def test_curriculum_languages
    # DCDO request is cached, and only called once
    DCDO.expects(:get).returns([["es-mx", "Spanish"]])

    # includes languages in DCDO
    assert_includes CDO.curriculum_languages, "es-mx"

    # includes additional languages
    assert_includes CDO.curriculum_languages, "zh-tw"
  end

  def test_curriculum_url
    CDO.stubs(:curriculum_languages).returns(["es-mx"])

    # generates a locale-aware link for supported languages
    assert_equal CDO.curriculum_url("es-mx", "/test"), "https://curriculum.code.org/es-mx/test"

    # generates an unmodified link to unknown languages
    assert_equal CDO.curriculum_url("fa-ke", "test"), "https://curriculum.code.org/test"
  end
end
