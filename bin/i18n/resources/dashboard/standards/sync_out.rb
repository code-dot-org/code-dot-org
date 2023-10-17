#!/usr/bin/env ruby

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../standards'

module I18n
  module Resources
    module Dashboard
      module Standards
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_locale_dir = crowdin_locale_dir_of(language)
            return unless File.directory?(crowdin_locale_dir)

            unless I18nScriptUtils.source_lang?(language)
              distribute_localizations(language)
            end

            i18n_locale_dir = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir)
          end

          private

          def crowdin_locale_dir_of(language)
            I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
          end

          def resource_i18n_data(resource_i18n_file_path)
            return {} unless File.exist?(resource_i18n_file_path)

            i18n_data = JSON.load_file(resource_i18n_file_path)
            return {} if i18n_data.nil? || i18n_data.empty?

            i18n_data.values.first['data'].values.first || {}
          end

          def distribute_localizations(language)
            frameworks_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "frameworks.#{language[:locale_s]}.json")
            categories_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "standard_categories.#{language[:locale_s]}.json")
            standards_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "standards.#{language[:locale_s]}.json")

            frameworks_i18n_data = resource_i18n_data(frameworks_i18n_file_path)
            categories_i18n_data = resource_i18n_data(categories_i18n_file_path)
            standards_i18n_data = resource_i18n_data(standards_i18n_file_path)

            Dir.glob(File.join(crowdin_locale_dir_of(language), '*.json')) do |crowdin_file_path|
              i18n_data = JSON.load_file(crowdin_file_path)
              framework = File.basename(crowdin_file_path, '.json')

              frameworks_i18n_data[framework] = i18n_data.slice('name')
              categories_i18n_data.merge!(i18n_data.fetch('categories', {}))
              standards_i18n_data.merge!(i18n_data.fetch('standards', {}))
            end

            I18nScriptUtils.sanitize_data_and_write(
              I18nScriptUtils.to_dashboard_i18n_data(language[:locale_s], 'frameworks', frameworks_i18n_data),
              frameworks_i18n_file_path
            )
            I18nScriptUtils.sanitize_data_and_write(
              I18nScriptUtils.to_dashboard_i18n_data(language[:locale_s], 'standard_categories', categories_i18n_data),
              categories_i18n_file_path
            )
            I18nScriptUtils.sanitize_data_and_write(
              I18nScriptUtils.to_dashboard_i18n_data(language[:locale_s], 'standards', standards_i18n_data),
              standards_i18n_file_path
            )
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Standards::SyncOut.perform if __FILE__ == $0
