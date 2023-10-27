#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../scripts'

module I18n
  module Resources
    module Dashboard
      module Scripts
        class SyncIn < I18n::Utils::SyncInBase
          def process
            # Backups the original i18n file for restoration
            I18nScriptUtils.copy_file(ORIGIN_I18N_FILE_PATH, I18N_BACKUP_FILE_PATH)

            # Prepares the i18n source file with redacted data
            I18nScriptUtils.write_yaml_file(I18N_SOURCE_FILE_PATH, i18n_data)
          end

          private

          def i18n_data
            i18n_data = YAML.load_file(ORIGIN_I18N_FILE_PATH)

            # Redacts script markdown data
            i18n_data.dig('en', 'data', 'script', 'name').values.each do |script_i18n_data|
              redactable_i18n_data = script_i18n_data.slice(*REDACTABLE_DATA_KEYS)

              redacted_i18n_data = RedactRestoreUtils.redact_data(redactable_i18n_data, REDACT_PLUGINS, REDACT_FORMAT)

              script_i18n_data.merge!(redacted_i18n_data)
            end

            i18n_data
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Scripts::SyncIn.perform if __FILE__ == $0
