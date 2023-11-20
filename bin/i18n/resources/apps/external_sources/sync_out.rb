#!/usr/bin/env ruby

require 'json'

require_relative '../../../../../pegasus/helpers/pegasus_languages'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        class SyncOut < I18n::Utils::SyncOutBase
          DATASETS_I18N_KEY = 'datasets'.freeze

          def process(language)
            distribute_ml_playground(language)
            distribute_blockly_core(language)
          end

          private

          def distribute_ml_playground(language)
            crowdin_locale_dir = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, ML_PLAYGROUND_DIR_NAME)
            return if I18nScriptUtils.source_lang?(language)

            js_locale = I18nScriptUtils.to_js_locale(language[:locale_s])
            target_i18n_file_path = CDO.dir("apps/i18n/mlPlayground/#{js_locale}.json")

            ### ml-playground strings to Apps directory
            crowdin_ml_playground_file_path = File.join(crowdin_locale_dir, ML_PLAYGROUND_FILE_NAME)
            if File.exist?(crowdin_ml_playground_file_path)
              i18n_data = JSON.load_file(crowdin_ml_playground_file_path)

              # Since `ml-playground/mlPlayground.json` doesn't contain `datasets` translations,
              # the existing `datasets` translations need to be put back into the apps i18n file
              if File.exist?(target_i18n_file_path)
                datasets_i18n_data = JSON.load_file(target_i18n_file_path)&.dig(DATASETS_I18N_KEY)
                i18n_data[DATASETS_I18N_KEY] ||= datasets_i18n_data if datasets_i18n_data
              end

              I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
            end

            ### Merge ml-playground datasets into apps' mlPlayground JSON
            Dir.glob(File.join(crowdin_locale_dir, DATASETS_DIR_NAME, '*.json')) do |crowdin_dataset_file_path|
              dataset_i18n_data = JSON.load_file(crowdin_dataset_file_path)
              next if dataset_i18n_data.empty?

              # Merge new `dataset` translations
              dataset_id = File.basename(crowdin_dataset_file_path, '.json')
              i18n_data = File.exist?(target_i18n_file_path) ? JSON.load_file(target_i18n_file_path) : {}
              i18n_data[DATASETS_I18N_KEY] ||= {}
              i18n_data[DATASETS_I18N_KEY][dataset_id] = dataset_i18n_data

              I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
            end
          ensure
            i18n_locale_dir = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME, ML_PLAYGROUND_DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir) if File.directory?(crowdin_locale_dir)
            I18nScriptUtils.remove_empty_dir(I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME))
          end

          def blockly_core_i18n_data(crowdin_file_path)
            i18n_source_file_path = File.join(BLOCKLY_CORE_I18N_SOURCE_DIR, BLOCKLY_CORE_FILE_NAME)
            source_i18n_data = File.exist?(i18n_source_file_path) ? JSON.load_file(i18n_source_file_path) : {}

            # Blockly doesn't know how to fall back to English, so here we manually and
            # explicitly default all untranslated strings to English.
            i18n_data = JSON.load_file(crowdin_file_path)
            # Create a hash containing all translations, with English strings in
            # place of any missing translations. We do this as 'english merge
            # translations' rather than 'translations merge english' to ensure that
            # we include all the keys from English, regardless of which keys are in
            # the translations hash.
            i18n_data = source_i18n_data.merge(i18n_data) {|_key, source, l10n| l10n.empty? ? source : l10n}

            I18nScriptUtils.sort_and_sanitize(i18n_data)
          end

          def distribute_blockly_core(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], BLOCKLY_CORE_DIR_NAME, BLOCKLY_CORE_FILE_NAME)
            return unless File.exist?(crowdin_file_path)
            return if I18nScriptUtils.source_lang?(language)

            i18n_data = blockly_core_i18n_data(crowdin_file_path)

            # Replaced the original script `apps/node_modules/@code-dot-org/blockly/i18n/codeorg-messages.sh`
            # to generate js translation files right away only for the "changed files"
            blockly_js_i18n_data = i18n_data.each_with_object('') do |(i18n_key, i18n_val), js_string|
              js_string << "Blockly.Msg.#{i18n_key} = #{JSON.dump(i18n_val)};\n"
            end

            js_locale = I18nScriptUtils.to_js_locale(language[:locale_s])
            target_i18n_file_path = CDO.dir("apps/lib/blockly/#{js_locale}.js")
            I18nScriptUtils.write_file(target_i18n_file_path, blockly_js_i18n_data)
          ensure
            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], BLOCKLY_CORE_DIR_NAME, BLOCKLY_CORE_FILE_NAME)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path) if File.exist?(crowdin_file_path)
            I18nScriptUtils.remove_empty_dir File.dirname(crowdin_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncOut.perform if __FILE__ == $0
