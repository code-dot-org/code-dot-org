#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/malformed_i18n_reporter'
require_relative '../blocks'

module I18n
  module Resources
    module Dashboard
      module Blocks
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
            return unless File.file?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              restore(language[:locale_s], crowdin_file_path)
              distribute_localization(language[:locale_s], crowdin_file_path)
            end

            I18nScriptUtils.move_file(crowdin_file_path, I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME, FILE_NAME))
          end

          private

          def restore(locale, crowdin_file_path)
            return unless File.exist?(I18N_BACKUP_FILE_PATH)

            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(locale)

            RedactRestoreUtils.restore_file(
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
            target_i18n_file_path = CDO.dir("dashboard/config/locales/blocks.#{locale}.yml")
            I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Blocks::SyncOut.perform if __FILE__ == $0
