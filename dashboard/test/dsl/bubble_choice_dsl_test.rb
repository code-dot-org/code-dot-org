require 'test_helper'

class BubbleChoiceDslTest < ActiveSupport::TestCase
  setup do
    create(:level, name: 'bubble choice level 1')
    create(:level, name: 'bubble choice level 2')
  end

  test 'create then serialize simple level returns original DSL' do
    input_dsl = <<~DSL
      name 'bubble choice'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'create then serialize with more fields returns original DSL' do
    input_dsl = <<~DSL
      name 'bubble choice'
      editor_experiment 'my experiment'
      display_name 'My Level Name'
      description 'My Description'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'serialize escapes single quotes' do
    input_dsl = <<~DSL
      name 'Author\\'s Choice'
      editor_experiment 'my experiment'
      display_name 'Author\\'s Display Name'
      description 'Author\\'s Description'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    # Make sure our input fields actually contain "'" but not "\"
    assert_equal "Author's Choice", bubble_choice.name
    assert_equal "Author's Display Name", bubble_choice.display_name
    assert_equal "Author's Description", bubble_choice.description
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'serialize strips empty fields' do
    input_dsl = <<~DSL
      name 'bubble choice'
      editor_experiment ''
      display_name ''
      description ''

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'

      markdown <<MARKDOWN

      MARKDOWN
    DSL

    output_dsl = <<~DSL
      name 'bubble choice'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal output_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'create then serialize with uses_lab2 returns original DSL' do
    input_dsl = <<~DSL
      name 'bubble choice'
      display_name 'My Level'
      description 'My Description'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'

      uses_lab2
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert bubble_choice.uses_lab2
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'create then serialize with all lab2 properties returns original DSL' do
    input_dsl = <<~DSL
      name 'bubble choice'
      display_name 'My Level'
      description 'My Description'

      sublevels
      level 'bubble choice level 1'
      level 'bubble choice level 2'

      custom_mode 'music_dance_ai'
      uses_lab2
      hide_letters_lab2
      standalone
      navigation_type 'next_level'
      finish_dialog 'hoai2025'
      hide_share_and_remix 'false'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert bubble_choice.uses_lab2
    assert bubble_choice.hide_letters_lab2
    assert bubble_choice.is_project_level
    assert_equal 'music_dance_ai', bubble_choice.custom_mode
    assert_equal 'next_level', bubble_choice.navigation_type
    assert_equal 'hoai2025', bubble_choice.finish_dialog
    assert_equal 'false', bubble_choice.hide_share_and_remix
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'create then serialize with navigation_type and finish_dialog returns original DSL' do
    input_dsl = <<~DSL
      name 'bubble choice'

      sublevels
      level 'bubble choice level 1'

      uses_lab2
      navigation_type 'next_level'
      finish_dialog 'hoai2025'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal 'next_level', bubble_choice.navigation_type
    assert_equal 'hoai2025', bubble_choice.finish_dialog
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'serialize escapes single quotes in finish_dialog' do
    input_dsl = <<~DSL
      name 'bubble choice'

      sublevels
      level 'bubble choice level 1'

      uses_lab2
      finish_dialog 'Author\\'s Dialog'
    DSL

    bubble_choice = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal "Author's Dialog", bubble_choice.finish_dialog
    assert_equal input_dsl, BubbleChoiceDSL.serialize(bubble_choice)
  end

  test 'escape method escapes single quotes' do
    result = BubbleChoiceDSL.escape("foo'bar")
    assert_equal "foo\\'bar", result
    assert_equal 8, result.length
  end
end
