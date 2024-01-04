#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/malformed_i18n_reporter'
require_relative '../courses'

module I18n
  module Resources
    module Dashboard
      module Courses
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = crowdin_file_path_of(language)
            return unless File.file?(crowdin_file_path)

            unless I18nScriptUtils.source_lang?(language)
              restore_localization(language)
              fix_localization_urls(language)
              report_malformed_i18n(language)
              distribute_localization(language)
            end

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME, FILE_NAME)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
          end

          private

          def crowdin_file_path_of(language)
            I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME, FILE_NAME)
          end

          def restore_localization(language)
            crowdin_file_path = crowdin_file_path_of(language)

            RedactRestoreUtils.restore(
              I18N_BACKUP_FILE_PATH,
              crowdin_file_path,
              crowdin_file_path,
              REDACT_PLUGINS,
              REDACT_FORMAT
            )
          end

          # We provide URLs to the translators for Resources only; because
          # the sync has a side effect of applying Markdown formatting to
          # everything it encounters, we want to make sure to un-Markdownify
          # these URLs
          def fix_localization_urls(language)
            i18n_data = YAML.load_file(crowdin_file_path_of(language))

            lang_code = i18n_data.keys.first
            i18n_data.dig(lang_code, 'data', 'resources')&.each do |_key, resource|
              next unless resource['url']

              resource['url'].strip!
              resource['url'].delete_prefix!('<')
              resource['url'].delete_suffix!('>')
            end

            I18nScriptUtils.write_file(crowdin_file_path_of(language), I18nScriptUtils.to_crowdin_yaml(i18n_data))
          end

          def report_malformed_i18n(language)
            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(language[:locale_s])
            malformed_i18n_reporter.process_file(crowdin_file_path_of(language))
            malformed_i18n_reporter.report
          end

          def distribute_localization(language)
            target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "courses.#{language[:locale_s]}.yml")
            I18nScriptUtils.sanitize_file_and_write(crowdin_file_path_of(language), target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Courses::SyncOut.perform if __FILE__ == $0
