#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/malformed_i18n_reporter'
require_relative '../../../redact_restore_utils'
require_relative '../labs'

module I18n
  module Resources
    module Apps
      module Labs
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_locale_dir = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
            return unless File.directory?(crowdin_locale_dir)

            unless I18nScriptUtils.source_lang?(language)
              restore_crawding_locale_files(language[:locale_s], crowdin_locale_dir)
              distribute_crawding_locale_files(language[:locale_s], crowdin_locale_dir)
            end

            i18n_locale_dir = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir)
          end

          private

          def restore_crawding_locale_files(locale, crowdin_locale_dir)
            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(locale)

            REDACTABLE_LABS.each do |lab_name|
              i18n_original_file_path = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME, "#{lab_name}.json")
              next unless File.exist?(i18n_original_file_path)

              file_name = File.basename(i18n_original_file_path)
              crowdin_locale_file_path = File.join(crowdin_locale_dir, file_name)
              next unless File.exist?(crowdin_locale_file_path)

              RedactRestoreUtils.restore(
                i18n_original_file_path,
                crowdin_locale_file_path,
                crowdin_locale_file_path,
                REDACT_PLUGINS
              )

              malformed_i18n_reporter.process_file(crowdin_locale_file_path)
            end
          ensure
            malformed_i18n_reporter.report
          end

          def lab_i18n_file_path(lab_name, js_locale)
            CDO.dir('apps/i18n', lab_name, "#{js_locale}.json")
          end

          def distribute_crawding_locale_files(locale, crowdin_locale_dir)
            js_locale = I18nScriptUtils.to_js_locale(locale)

            Dir.glob(File.join(crowdin_locale_dir, '*.json')) do |crowdin_locale_file_path|
              lab_name = File.basename(crowdin_locale_file_path, '.json')
              next if UNTRANSLATABLE_LABS.include?(lab_name)

              I18nScriptUtils.sanitize_file_and_write(crowdin_locale_file_path, lab_i18n_file_path(lab_name, js_locale))
            end

            # For untranslated apps, copy English file for all locales
            UNTRANSLATABLE_LABS.each do |lab_name|
              en_lab_i18n_file_path = lab_i18n_file_path(lab_name, 'en_us')
              next unless File.exist?(en_lab_i18n_file_path)

              I18nScriptUtils.copy_file en_lab_i18n_file_path, lab_i18n_file_path(lab_name, js_locale)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncOut.perform if __FILE__ == $0
