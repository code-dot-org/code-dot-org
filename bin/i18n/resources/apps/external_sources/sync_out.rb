#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../../pegasus/helpers/pegasus_languages'
require_relative '../../../i18n_script_utils'
require_relative '../external_sources'

module I18n
  module Resources
    module Apps
      module ExternalSources
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale = pegasus_lang[:crowdin_name_s]
              locale = pegasus_lang[:locale_s]
              js_locale = I18nScriptUtils.to_js_locale(locale)

              crowdin_locale_dir = CDO.dir(File.join(I18N_LOCALES_DIR, crowdin_locale))
              i18n_locale_dir = CDO.dir(File.join(I18N_LOCALES_DIR, locale))

              crowdin_locale_resource_dir = File.join(crowdin_locale_dir, DIR_NAME)
              if File.directory?(crowdin_locale_resource_dir)
                distribute_ml_playground(js_locale, crowdin_locale_resource_dir) unless locale == 'en-US'

                I18nScriptUtils.rename_dir(crowdin_locale_resource_dir, File.join(i18n_locale_dir, DIR_NAME))
              end

              crowdin_locale_blockly_core_dir = File.join(crowdin_locale_dir, BLOCKLY_CORE_DIR_NAME)
              if File.directory?(crowdin_locale_blockly_core_dir)
                distribute_blockly_core(js_locale, crowdin_locale_blockly_core_dir) unless locale == 'en-US'

                I18nScriptUtils.rename_dir(crowdin_locale_blockly_core_dir, File.join(i18n_locale_dir, BLOCKLY_CORE_DIR_NAME))
              end
            ensure
              mutex.synchronize do
                I18nScriptUtils.delete_empty_crowdin_locale_dir(crowdin_locale)

                progress_bar.increment
              end
            end

            progress_bar.finish
          end

          private

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Apps/external_sources sync-out',
              total: pegasus_languages.size,
            )
          end

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def blockly_core_source_translations
            @blockly_core_source_translations ||= begin
              i18n_source_blockly_core_file_path = CDO.dir(File.join(I18N_SOURCE_DIR, BLOCKLY_CORE_DIR_NAME, 'core.json'))
              File.exist?(i18n_source_blockly_core_file_path) ? JSON.load_file(i18n_source_blockly_core_file_path) : {}
            end
          end

          def distribute_ml_playground(js_locale, crowdin_locale_resource_dir)
            ### ml-playground strings to Apps directory
            crowdin_locale_ml_playground_file_path = File.join(crowdin_locale_resource_dir, 'ml-playground/mlPlayground.json')
            apps_i18n_ml_playground_file_path = CDO.dir(File.join('apps/i18n/mlPlayground', "#{js_locale}.json"))
            if File.exist?(crowdin_locale_ml_playground_file_path)
              I18nScriptUtils.sanitize_file_and_write(crowdin_locale_ml_playground_file_path, apps_i18n_ml_playground_file_path)
            end

            ### Merge ml-playground datasets into apps' mlPlayground JSON
            Dir.glob(File.join(crowdin_locale_resource_dir, 'ml-playground/datasets/*.json')) do |crowdin_locale_dataset_file_path|
              dataset_translations = JSON.load_file(crowdin_locale_dataset_file_path)
              next if dataset_translations.empty?

              # Merge new translations
              dataset_id = File.basename(crowdin_locale_dataset_file_path, '.json')
              translations = File.exist?(apps_i18n_ml_playground_file_path) ? JSON.load_file(apps_i18n_ml_playground_file_path) || {} : {}
              translations['datasets'] ||= {}
              translations['datasets'][dataset_id] = dataset_translations
              I18nScriptUtils.sanitize_data_and_write(translations, apps_i18n_ml_playground_file_path)
            end
          end

          def distribute_blockly_core(js_locale, crowdin_locale_blockly_core_dir)
            ### Blockly Core
            crowdin_locale_blockly_core_file_path = File.join(crowdin_locale_blockly_core_dir, 'core.json')
            return unless File.exist?(crowdin_locale_blockly_core_file_path)

            # Blockly doesn't know how to fall back to English, so here we manually and
            # explicitly default all untranslated strings to English.
            translations = JSON.load_file(crowdin_locale_blockly_core_file_path)
            # Create a hash containing all translations, with English strings in
            # place of any missing translations. We do this as 'english merge
            # translations' rather than 'translations merge english' to ensure that
            # we include all the keys from English, regardless of which keys are in
            # the translations hash.
            translations_with_fallback = blockly_core_source_translations.merge(translations) do |_key, english, translation|
              translation.empty? ? english : translation
            end
            translations_with_fallback = I18nScriptUtils.sort_and_sanitize(translations_with_fallback)

            # Replaced the original script `apps/node_modules/@code-dot-org/blockly/i18n/codeorg-messages.sh`
            # to generate js translation files right away only for the "changed files"
            blockly_js_translations = translations_with_fallback.each_with_object('') do |(i18n_key, i18n_val), js_string|
              js_string << "Blockly.Msg.#{i18n_key} = #{JSON.dump(i18n_val)};\n"
            end
            blockly_i18n_file_path = CDO.dir(File.join('apps/lib/blockly', "#{js_locale}.js"))
            FileUtils.mkdir_p(File.dirname(blockly_i18n_file_path))
            File.write(blockly_i18n_file_path, blockly_js_translations)
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::ExternalSources::SyncOut.perform if __FILE__ == $0
