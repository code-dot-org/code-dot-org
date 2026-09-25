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
end
