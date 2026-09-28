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
end
