require 'test_helper'

class ScriptLevelsHelperTest < ActionView::TestCase

  test 'tracking_pixel_url' do
    # hoc and special
    assert_equal '//test.code.org/api/hour/begin_codeorg.png', tracking_pixel_url(Script.find(Script::HOC_ID))
    assert_equal '//test.code.org/api/hour/begin_codeorg.png', tracking_pixel_url(Script.find_by_name(Script::SPECIAL_NAME))

    assert_equal '//test.code.org/api/hour/begin_frozen.png', tracking_pixel_url(Script.find_by_name('frozen'))
    assert_equal '//test.code.org/api/hour/begin_course4.png', tracking_pixel_url(Script.find_by_name('course4'))
  end

  test 'hoc_finish_url' do
    # hoc and special
    assert_equal '//test.code.org/api/hour/finish', hoc_finish_url(Script.find(Script::HOC_ID))
    assert_equal '//test.code.org/api/hour/finish', hoc_finish_url(Script.find_by_name(Script::SPECIAL_NAME))

    assert_equal '//test.code.org/api/hour/finish/frozen', hoc_finish_url(Script.find_by_name('frozen'))
    assert_equal '//test.code.org/api/hour/finish/course4', hoc_finish_url(Script.find_by_name('course4'))
  end
end
