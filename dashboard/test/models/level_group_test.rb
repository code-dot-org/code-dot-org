require 'test_helper'

class LevelGroupTest < ActiveSupport::TestCase

  test 'get level group pages' do
    input_dsl = "
  name 'long assessment'
  title 'Long Assessment'
  submittable 'true'

  page
  level 'level1'
  level 'level2'
  level 'level3'
  page
  level 'level4'
  level 'level5'
  page
  level 'level6'
  level 'level7'
  "

    level = LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: input_dsl})
    pages = level.pages

    assert_equal 'Long Assessment', level.properties['title']
    assert_equal pages[0].offset, 0
    assert_equal pages[0].page_number, 1
    assert_equal pages[1].offset, 3
    assert_equal pages[1].page_number, 2
    assert_equal pages[2].offset, 5
    assert_equal pages[2].page_number, 3
  end

end
