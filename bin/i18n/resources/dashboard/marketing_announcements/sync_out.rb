#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../marketing_announcements'

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        class SyncOut < I18n::Utils::SyncOutBase
          MARKETING_ANNOUNCEMENTS_TYPE = 'marketing_announcements'.freeze

          def process(language)
            crowdin_file_path = I18nScriptUtils.crowdin_locale_dir(language[:locale_s], FILE_PATH)
            return unless File.file?(crowdin_file_path)

            distribute_localization(language, crowdin_file_path)

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], FILE_PATH)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
            I18nScriptUtils.remove_empty_dir File.dirname(crowdin_file_path)
          end

          private

          def distribute_localization(language, file_path)
            crowdin_translations = I18nScriptUtils.parse_file(file_path)

            i18n_data = I18nScriptUtils.to_dashboard_i18n_data(language[:locale_s], MARKETING_ANNOUNCEMENTS_TYPE, crowdin_translations)
            target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "#{MARKETING_ANNOUNCEMENTS_TYPE}.#{language[:locale_s]}.json")
            I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut.perform if __FILE__ == $0
