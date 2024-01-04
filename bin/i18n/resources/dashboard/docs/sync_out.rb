#!/usr/bin/env ruby

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../redact_restore_utils'
require_relative '../docs'

module I18n
  module Resources
    module Dashboard
      module Docs
        class SyncOut < I18n::Utils::SyncOutBase
          PROGRAMMING_ENVS_TYPE = 'programming_environments'.freeze

          def process(language)
            crowdin_locale_dir = crowdin_locale_dir_of(language)
            return unless File.directory?(crowdin_locale_dir)

            unless I18nScriptUtils.source_lang?(language)
              distribute_localization(language)
            end

            i18n_locale_dir = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir)
          end

          private

          def crowdin_locale_dir_of(language)
            I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
          end

          def new_programming_envs_i18n_data(crowdin_file_path)
            file_subpath = crowdin_file_path.partition(DIR_NAME).last
            original_file_path = File.join(I18N_BACKUP_DIR_PATH, file_subpath)
            RedactRestoreUtils.restore(original_file_path, crowdin_file_path, crowdin_file_path, REDACT_PLUGINS)
            I18nScriptUtils.parse_file(crowdin_file_path) || {}
          end

          def programming_envs_i18n_data(target_i18n_file_path)
            return {} unless File.exist?(target_i18n_file_path)

            i18n_data = I18nScriptUtils.parse_file(target_i18n_file_path)
            return {} if i18n_data.empty?

            i18n_data.values.first.dig('data', PROGRAMMING_ENVS_TYPE) || {}
          end

          def distribute_localization(language)
            crowdin_file_paths = Dir.glob(File.join(crowdin_locale_dir_of(language), '*.json'))

            progress_bar.total += crowdin_file_paths.size

            crowdin_file_paths.each do |crowdin_file_path|
              programming_env = File.basename(crowdin_file_path, '.json')
              next unless TRANSLATABLE_PROGRAMMING_ENVS.include?(programming_env)

              target_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, "#{PROGRAMMING_ENVS_TYPE}.#{language[:locale_s]}.json")

              programming_envs_i18n_data = programming_envs_i18n_data(target_i18n_file_path)
              programming_envs_i18n_data.merge!(new_programming_envs_i18n_data(crowdin_file_path))

              # JSON files in this directory need the root key to be set to the locale
              dashboard_i18n_data = I18nScriptUtils.to_dashboard_i18n_data(
                language[:locale_s], PROGRAMMING_ENVS_TYPE, programming_envs_i18n_data
              )

              I18nScriptUtils.sanitize_data_and_write(dashboard_i18n_data, target_i18n_file_path)
            ensure
              mutex.synchronize {progress_bar.increment}
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Docs::SyncOut.perform if __FILE__ == $0
