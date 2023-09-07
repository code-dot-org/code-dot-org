#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        module SyncIn
          def self.perform
            puts 'Preparing external sources'

            # Preparing Blockly Core files
            blockly_core_dir = CDO.dir(File.join(I18N_SOURCE_DIR, 'blockly-core'))
            FileUtils.mkdir_p(blockly_core_dir)
            Dir[CDO.dir('apps/node_modules/@code-dot-org/blockly/i18n/locales/en-US/*.json')].each do |filepath|
              FileUtils.cp(filepath, blockly_core_dir)
            end

            FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

            # ml-playground (AI Lab) files

            # Preparing AI Lab UI Strings
            ml_playground_dir = File.join(I18N_SOURCE_DIR_PATH, 'ml-playground')
            FileUtils.mkdir_p(ml_playground_dir)
            FileUtils.cp(CDO.dir('apps/node_modules/@code-dot-org/ml-playground/i18n/mlPlayground.json'), ml_playground_dir)

            # Preparing AI Lab datasets
            datasets_source_dir = File.join(ml_playground_dir, 'datasets')
            FileUtils.mkdir_p(datasets_source_dir)
            Dir[CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets/*.json')].each do |filepath|
              FileUtils.cp(filepath, datasets_source_dir)
            end

            # Get the display names of the datasets stored in the dataset manifest file.
            # manifest = File.join(ml_playground_dir, 'datasets-manifest.json')
            manifest = CDO.dir('apps/node_modules/@code-dot-org/ml-playground/public/datasets-manifest.json')
            manifest_datasets = JSON.load_file(manifest)['datasets']
            dataset_names = manifest_datasets.map {|dataset| [dataset['id'], dataset['name']]}.to_h

            # These are overwritten in this format so the properties that use
            # arrays have unique identifiers for translation.
            Dir[File.join(datasets_source_dir, '*')].each do |dataset_file|
              original_dataset = JSON.load_file(dataset_file)

              # Converts array to map and uses the field id as a unique identifier.
              fields_as_hash = original_dataset['fields'].map do |field|
                [
                  field['id'],
                  {
                    'id' => field['id'],
                    'description' => field['description']
                  }
                ]
              end.to_h

              final_dataset = {
                'fields' => fields_as_hash,
                'card' => {
                  'description' => original_dataset.dig('card', 'description'),
                  'context' => {
                    'potentialUses' => original_dataset.dig('card', 'context', 'potentialUses'),
                    'potentialMisuses' => original_dataset.dig('card', 'context', 'potentialMisuses')
                  }
                }
              }
              dataset_name = dataset_names[original_dataset['name']]
              final_dataset['name'] = dataset_name if dataset_name

              File.write(dataset_file, JSON.pretty_generate(final_dataset))
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncIn.perform if __FILE__ == $0
