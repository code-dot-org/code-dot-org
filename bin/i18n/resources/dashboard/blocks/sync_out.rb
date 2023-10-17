#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../../../utils/malformed_i18n_reporter'
require_relative '../blocks'

module I18n
  module Resources
    module Dashboard
      module Blocks
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale_dir = I18nScriptUtils.locale_dir(pegasus_lang[:crowdin_name_s])
              crowdin_file_path = File.join(crowdin_locale_dir, DIR_NAME, FILE_NAME)
              next unless File.file?(crowdin_file_path)

              locale = pegasus_lang[:locale_s]
              unless locale == 'en-US'
                restore(locale, crowdin_file_path)
                distribute_localization(locale, crowdin_file_path)
              end

              I18nScriptUtils.move_file(crowdin_file_path, I18nScriptUtils.locale_dir(locale, DIR_NAME, FILE_NAME))
            ensure
              I18nScriptUtils.remove_empty_dir(crowdin_locale_dir)

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
              title: 'Dashboard/blocks sync-out',
              total: pegasus_languages.size
            )
          end

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def restore(locale, crowdin_file_path)
            return unless File.exist?(I18N_BACKUP_FILE_PATH)

            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(locale)

            RedactRestoreUtils.restore(
              I18N_BACKUP_FILE_PATH,
              crowdin_file_path,
              crowdin_file_path,
              REDACT_PLUGINS,
              REDACT_FORMAT
            )

            malformed_i18n_reporter.process_file(crowdin_file_path)
            malformed_i18n_reporter.report
          end

          def distribute_localization(locale, crowdin_file_path)
            target_i18n_file_path = CDO.dir('dashboard/config/locales', "blocks.#{locale}.yml")
            I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Blocks::SyncOut.perform if __FILE__ == $0
