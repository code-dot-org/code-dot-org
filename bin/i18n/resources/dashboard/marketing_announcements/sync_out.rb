# frozen_string_literal: true

module I18n
  module Resources
    module Dashboard
      module MarketingAnnouncements
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_file_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], File.join('dashboard', DIR_NAME), FILE_NAME)
            return unless File.exist?(crowdin_file_path)

            i18n_locale = language[:locale_s]
            distribute_localization(i18n_locale, crowdin_file_path) unless I18nScriptUtils.source_lang?(language)

            i18n_file_path = I18nScriptUtils.locale_dir(i18n_locale, DIR_NAME, FILE_NAME)
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
          end

          private

          def distribute_localization(i18n_locale,  crowdin_file_path)
            crowdin_translations = JSON.load_file(crowdin_file_path)

            i18n_data = I18nScriptUtils.to_dashboard_i18n_data(i18n_locale, 'marketing_announcements', crowdin_translations)
            target_i18n_file_path = CDO.dir('dashboard/config/locales', "marketing_announcements.#{i18n_locale}.json")

            I18nScriptUtils.sanitize_data_and_write(i18n_data, target_i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::MarketingAnnouncements::SyncOut.perform if __FILE__ == $0
