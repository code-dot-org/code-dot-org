#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../labs'

module I18n
  module Resources
    module Apps
      module Labs
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale = pegasus_lang[:crowdin_name_s]
              crowdin_locale_resource_dir = I18nScriptUtils.locale_dir(crowdin_locale, DIR_NAME)
              next unless File.directory?(crowdin_locale_resource_dir)

              locale = pegasus_lang[:locale_s]

              unless locale == 'en-US'
                mutex.synchronize {restore_crawding_locale_files(locale, crowdin_locale_resource_dir)}
                distribute_crawding_locale_files(locale, crowdin_locale_resource_dir)
              end

              I18nScriptUtils.rename_dir(crowdin_locale_resource_dir, I18nScriptUtils.locale_dir(locale, DIR_NAME))
            ensure
              I18nScriptUtils.delete_empty_crowdin_locale_dir(crowdin_locale)

              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          private

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Apps/labs sync-out',
              total: pegasus_languages.size,
            )
          end

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def restore_crawding_locale_files(locale, crowdin_locale_resource_dir)
            REDACTABLE.each do |lab_name|
              i18n_original_file_path = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME, "#{lab_name}.json")
              next unless File.exist?(i18n_original_file_path)

              file_name = File.basename(i18n_original_file_path)
              crowdin_locale_file_path = File.join(crowdin_locale_resource_dir, file_name)
              next unless File.exist?(crowdin_locale_file_path)

              RedactRestoreUtils.restore(
                i18n_original_file_path,
                crowdin_locale_file_path,
                crowdin_locale_file_path,
                REDACT_PLUGINS
              )

              I18nScriptUtils.find_malformed_links_images(locale, crowdin_locale_file_path)
            end
            I18nScriptUtils.upload_malformed_restorations(locale)
          end

          def lab_i18n_file_path(lab_name, js_locale)
            CDO.dir('apps/i18n', lab_name, "#{js_locale}.json")
          end

          def distribute_crawding_locale_files(locale, crowdin_locale_resource_dir)
            js_locale = I18nScriptUtils.to_js_locale(locale)

            Dir.glob(File.join(crowdin_locale_resource_dir, '*.json')) do |crowdin_locale_file_path|
              lab_name = File.basename(crowdin_locale_file_path, '.json')
              next if UNTRANSLATABLE.include?(lab_name)

              I18nScriptUtils.sanitize_file_and_write(crowdin_locale_file_path, lab_i18n_file_path(lab_name, js_locale))
            end

            # For untranslated apps, copy English file for all locales
            UNTRANSLATABLE.each do |lab_name|
              en_lab_i18n_file_path = lab_i18n_file_path(lab_name, 'en_us')
              next unless File.exist?(en_lab_i18n_file_path)

              FileUtils.cp_r en_lab_i18n_file_path, lab_i18n_file_path(lab_name, js_locale)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncOut.perform if __FILE__ == $0
