require 'test_helper'

class AilabTest < ActiveSupport::TestCase
  test 'non_blockly_puzzle_level_options returns translated dynamic_instructions when necessary' do
    level = create(:ailab, name: 'ailab_test')
    dynamic_instructions = {
      "selectDataset" => "Original selectDataset",
      "uploadedDataset" => "Original uploadedDataset",
      "selectedDataset" => "Original selectedDataset",
      "dataDisplayLabel" => "Original dataDisplayLabel",
      "dataDisplayFeatures" => "Original dataDisplayFeatures",
      "selectedFeatureNumerical" => "Original selectedFeatureNumerical",
      "selectedFeatureCategorical" => "Original selectedFeatureCategorical",
      "trainModel" => "Original trainModel",
      "generateResults" => "Original generateResults",
      "results" => "Original results",
      "resultsDetails" => "Original resultsDetails",
      "saveModel" => "Original saveModel",
      "modelSummary" => "Original modelSummary"
    }

    level.dynamic_instructions = JSON.dump(dynamic_instructions)
    translated_dynamic_instructions = Hash.new
    dynamic_instructions.each do |k, v|
      translated_dynamic_instructions[k] = v.sub 'Original', 'Translated'
    end

    test_locale = :'te-ST'
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "dynamic_instructions" => {
          "ailab_test" => translated_dynamic_instructions
        }
      }
    }

    I18n.backend.store_translations test_locale, custom_i18n

    options = level.non_blockly_puzzle_level_options
    # The option keys are camelized for the frontend
    assert_equal options['dynamicInstructions'], JSON.dump(translated_dynamic_instructions)
  end

  test 'lab2 level is valid with exactly one known dataset' do
    level = build(:ailab, uses_lab2: 'true', mode: '{"datasets": ["zoo"], "hideSave": true}')
    assert level.valid?, level.errors.full_messages.join(', ')
  end

  test 'lab2 level requires exactly one known dataset' do
    ['', '{"hideSave": true}', '{"datasets": []}', '{"datasets": ["zoo", "heart"]}', '{"datasets": ["nope"]}', '{"datasets": "zoo"}', "{'datasets': ['zoo']}", '["zoo"]'].each do |mode|
      level = build(:ailab, uses_lab2: 'true', mode: mode)
      refute level.valid?, "expected mode #{mode.inspect} to be invalid"
      assert_equal ['must select exactly one dataset.'], level.errors[:mode]
    end
  end

  test 'lab2 level accepts a required accuracy from 0 to 100' do
    [0, 70, 99.5, 100].each do |accuracy|
      level = build(:ailab, uses_lab2: 'true', mode: {datasets: ['zoo'], requireAccuracy: accuracy}.to_json)
      assert level.valid?, "expected requireAccuracy #{accuracy.inspect} to be valid: #{level.errors.full_messages.join(', ')}"
    end
  end

  test 'lab2 level rejects a required accuracy outside 0 to 100' do
    [-5, 150, '70', true, nil].each do |accuracy|
      level = build(:ailab, uses_lab2: 'true', mode: {datasets: ['zoo'], requireAccuracy: accuracy}.to_json)
      refute level.valid?, "expected requireAccuracy #{accuracy.inspect} to be invalid"
      assert_equal ['must have a required accuracy from 0 to 100.'], level.errors[:mode]
    end
  end

  test 'lab2 level derives validations from requireAccuracy' do
    level = build(:ailab, uses_lab2: 'true', mode: {datasets: ['zoo'], requireAccuracy: 70}.to_json)
    met, unmet = level.get_validations
    assert_equal [{'name' => 'ACCURACY_AT_LEAST', 'value' => 70}], met['conditions']
    assert met['next']
    assert_equal 'Train a model with at least 70% accuracy to continue.', unmet['message']
    refute unmet['next']
    assert level.validated?
  end

  test 'lab2 level without a positive requireAccuracy has no validations' do
    [{datasets: ['zoo']}, {datasets: ['zoo'], requireAccuracy: 0}].each do |mode|
      level = build(:ailab, uses_lab2: 'true', mode: mode.to_json)
      assert_nil level.get_validations
      refute level.validated?
    end
  end

  test 'legacy level has no validations' do
    level = build(:ailab, mode: {requireAccuracy: 70}.to_json)
    assert_nil level.get_validations
  end

  test 'lab2 level is channel backed' do
    level = build(:ailab, uses_lab2: 'true', mode: '{"datasets": ["zoo"]}')
    assert level.channel_backed?
  end

  test 'lab2 level hides share and remix even when the level allows them' do
    level = create(:ailab, uses_lab2: 'true', mode: '{"datasets": ["zoo"]}', hide_share_and_remix: 'false')
    assert_equal true, level.summarize_for_lab2_properties(nil)['hideShareAndRemix']
  end

  test 'legacy level is not channel backed' do
    level = build(:ailab, mode: '{"hideSave": true}')
    refute level.channel_backed?
  end

  test 'legacy level does not require a dataset' do
    [nil, 'false'].each do |uses_lab2|
      level = build(:ailab, uses_lab2: uses_lab2, mode: '{"hideSave": true}')
      assert level.valid?, level.errors.full_messages.join(', ')
    end
  end

  test 'dataset_ids reads the ailab package manifest' do
    assert_includes Ailab.dataset_ids, 'zoo'
    assert_includes Ailab.dataset_ids, 'shapes_v1_toy'
  end

  test 'generated_long_instructions lists each screen, using defaults for screens left blank' do
    level = build(:ailab, uses_lab2: 'true', dynamic_instructions: '{"results": "**Do This:** Test your model!"}')
    expected = <<~MARKDOWN.chomp
      This level has dynamic instructions that change as you interact with AI Lab.

      - _The instructions for the **Dataset** screen say:_ Choose one column to predict, and one or more columns to help make the prediction.

      - _The instructions for the **Testing** screen say:_ **Do This:** Test your model!
    MARKDOWN
    assert_equal expected, level.generated_long_instructions
  end

  test 'generated_long_instructions keeps multi-line text inside its list item' do
    level = build(:ailab, uses_lab2: 'true', dynamic_instructions: JSON.dump({results: "Test your model!\n\nThen check the accuracy."}))
    assert_includes level.generated_long_instructions,
      "- _The instructions for the **Testing** screen say:_ Test your model!\n  \n  Then check the accuracy."
  end

  test 'generated_long_instructions uses translated dynamic instructions' do
    level = build(:ailab, name: 'ailab_generated_test', uses_lab2: 'true', dynamic_instructions: '{"results": "Original results"}')
    test_locale = :'te-ST'
    I18n.backend.store_translations test_locale, {
      "data" => {"dynamic_instructions" => {"ailab_generated_test" => {"results" => "Translated results"}}}
    }

    I18n.with_locale(test_locale) do
      assert_includes level.generated_long_instructions, "Translated results"
    end
  end

  test 'generated_long_instructions falls back to default text for malformed dynamic instructions' do
    defaults = build(:ailab, uses_lab2: 'true').generated_long_instructions
    ['{not json', '["results"]', '3', '{"results": 3}'].each do |dynamic_instructions|
      level = build(:ailab, uses_lab2: 'true', dynamic_instructions: dynamic_instructions)
      assert_equal defaults, level.generated_long_instructions, dynamic_instructions
    end
  end

  test 'generated_long_instructions is nil for legacy levels' do
    [nil, 'false'].each do |uses_lab2|
      level = build(:ailab, uses_lab2: uses_lab2, dynamic_instructions: '{"results": "Done."}')
      assert_nil level.generated_long_instructions
    end
  end

  test 'lesson plan summaries carry the generated long instructions for lab2 levels' do
    level = create(:ailab, uses_lab2: 'true', mode: '{"datasets": ["zoo"]}', dynamic_instructions: '{"results": "Done."}')
    assert_equal level.generated_long_instructions, level.summarize_for_lesson_show(false)[:longInstructions]
    assert_equal level.generated_long_instructions, level.summary_for_lesson_plans['long_instructions']
  end

  test 'lesson plan summaries keep stored long instructions for legacy levels' do
    level = create(:ailab, long_instructions: 'Stored.')
    assert_equal 'Stored.', level.summarize_for_lesson_show(false)[:longInstructions]
    assert_equal 'Stored.', level.summary_for_lesson_plans['long_instructions']
  end

  test 'saving a lab2 level drops stored long instructions' do
    lab2_level = create(:ailab, uses_lab2: 'true', mode: '{"datasets": ["zoo"]}', long_instructions: 'Stored.')
    refute lab2_level.reload.properties.key?('long_instructions')

    [nil, 'false'].each do |uses_lab2|
      legacy_level = create(:ailab, uses_lab2: uses_lab2, long_instructions: 'Stored.')
      assert_equal 'Stored.', legacy_level.reload.long_instructions
    end
  end
end
