#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        class SyncIn < I18n::Utils::SyncInBase
          BLOCKLY_CORE_DIR_PATH = CDO.dir('apps/node_modules/@code-dot-org/blockly/i18n/locales/en-US').freeze
          ML_PLAYGROUND_FILE_PATH = CDO.dir('apps/node_modules/@code-dot-org/ml-playground/i18n/mlPlayground.json').freeze
          DATASETS_MANIFEST_FILE_PATH = CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets-manifest.json').freeze
          DATASETS_DIR_PATH = CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets').freeze

          def process
            prepare_blockly_core_files
            progress_bar.progress = 40

            prepare_ml_playground_file
            progress_bar.progress = 50

            prepare_dataset_files
            progress_bar.progress = 100
          end

          private

          def prepare_blockly_core_files
            Dir.glob(File.join(BLOCKLY_CORE_DIR_PATH, '*.json')) do |filepath|
              I18nScriptUtils.copy_file(filepath, BLOCKLY_CORE_I18N_SOURCE_DIR)
            end
          end

          # Prepares AI Lab UI Strings
          def prepare_ml_playground_file
            I18nScriptUtils.copy_file(ML_PLAYGROUND_FILE_PATH, ML_PLAYGROUND_I18N_SOURCE_DIR)
          end

          # Gets the display names of the datasets stored in the dataset manifest file.
          def dataset_names
            @dataset_names ||= begin
              manifest_datasets = I18nScriptUtils.parse_file(DATASETS_MANIFEST_FILE_PATH)['datasets']
              manifest_datasets.map {|dataset| [dataset['id'], dataset['name']]}.to_h
            end
          end

          # Prepares AI Lab datasets
          def prepare_dataset_files
            Dir.glob(File.join(DATASETS_DIR_PATH, '*.json')) do |dataset_file_path|
              original_dataset = I18nScriptUtils.parse_file(dataset_file_path)
              i18n_data = {}

              dataset_name = dataset_names[original_dataset['name']]
              i18n_data['name'] = dataset_name if dataset_name

              i18n_data['card'] = {
                'description' => original_dataset.dig('card', 'description'),
                'context'     => {
                  'potentialUses'    => original_dataset.dig('card', 'context', 'potentialUses'),
                  'potentialMisuses' => original_dataset.dig('card', 'context', 'potentialMisuses'),
                }
              }

              i18n_data['fields'] = original_dataset['fields'].each_with_object({}) do |field, fields|
                fields[field['id']] = {
                  'id'          => field['id'],
                  'description' => field['description'],
                }
              end

              i18n_source_file_path = File.join(DATASETS_I18N_SOURCE_DIR, File.basename(dataset_file_path))
              I18nScriptUtils.write_json_file(i18n_source_file_path, i18n_data)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncIn.perform if __FILE__ == $0
