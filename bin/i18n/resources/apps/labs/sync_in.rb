#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../labs'

module I18n
  module Resources
    module Apps
      module Labs
        class SyncIn < I18n::Utils::SyncInBase
          def process
            prepare_i18n_source_files
            progress_bar.progress = 50

            redact_i18n_source_files
            progress_bar.progress = 100
          end

          private

          def prepare_i18n_source_files
            Dir.glob(CDO.dir('apps/i18n/**/en_us.json')) do |filepath|
              lab_name = File.basename(File.dirname(filepath))
              I18nScriptUtils.copy_file(filepath, File.join(I18N_SOURCE_DIR_PATH, "#{lab_name}.json"))
            end

            # `@code-dot-org/ml-activities/i18n/oceans.json` is used as the i18n source for `apps/i18n/fish/*.json`
            # instead of the original file `apps/i18n/fish/en_us.json`
            oceans_lab_path = CDO.dir('apps/node_modules/@code-dot-org/ml-activities/i18n/oceans.json')
            I18nScriptUtils.copy_file(oceans_lab_path, File.join(I18N_SOURCE_DIR_PATH, 'fish.json')) if File.exist?(oceans_lab_path)
          end

          def redact_i18n_source_files
            # Only CSD labs are redacted, since other labs were already part of the i18n pipeline and redaction would edit
            # strings existing in crowdin already
            REDACTABLE_LABS.each do |lab_name|
              file_name = "#{lab_name}.json"
              source_path = File.join(I18N_SOURCE_DIR_PATH, file_name)
              next unless File.exist?(source_path)

              RedactRestoreUtils.backup_source_file(source_path)

              RedactRestoreUtils.redact(source_path, source_path, REDACT_PLUGINS)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncIn.perform if __FILE__ == $0
