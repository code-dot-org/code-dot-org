require 'test_helper'

# Note: There's also a dsl_test in test/dsl. These tests currently don't get run
# and would fail if they did.

class DslTest < ActiveSupport::TestCase
  test 'remove property' do
    input_dsl = "
  name 'my_multi'
  title 'g(y) = y + 3'
  question 'What is the name of this function?'
  content1 'content1'
  right 'g'
  wrong 'y'
  wrong '3'
  "
    input_dsl_without_content = "
  name 'my_multi'
  title 'g(y) = y + 3'
  question 'What is the name of this function?'
  right 'g'
  wrong 'y'
  wrong '3'
  "
    level = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl})

    level_modified = Multi.create_from_level_builder({}, {name: 'my_multi', dsl_text: input_dsl_without_content})

    assert_equal 'content1', level.properties['content1']
    assert_equal nil, level_modified.properties['content1']
  end
end
