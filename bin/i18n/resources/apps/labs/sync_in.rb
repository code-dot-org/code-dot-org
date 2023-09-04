#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../labs'

module I18n
  module Resources
    module Apps
      module Labs
        class SyncIn
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            prepare_i18n_source_files
            progress_bar.progress = 50

            redact_i18n_source_files
            progress_bar.progress = 100

            progress_bar.finish
          end

          private

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(title: 'Apps/labs sync-in')
          end

          def prepare_i18n_source_files
            FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

            Dir.glob(CDO.dir('apps/i18n/**/en_us.json')) do |filepath|
              lab_name = File.basename(File.dirname(filepath))
              FileUtils.cp(filepath, File.join(I18N_SOURCE_DIR_PATH, "#{lab_name}.json"))
            end

            # `@code-dot-org/ml-activities/i18n/oceans.json` is used as the i18n source for `apps/i18n/fish/*.json`
            # instead of the original file `apps/i18n/fish/en_us.json`
            oceans_lab_path = CDO.dir('apps/node_modules/@code-dot-org/ml-activities/i18n/oceans.json')
            FileUtils.cp(oceans_lab_path, File.join(I18N_SOURCE_DIR_PATH, 'fish.json')) if File.exist?(oceans_lab_path)
          end

          def redact_i18n_source_files
            # Only CSD labs are redacted, since other labs were already part of the i18n pipeline and redaction would edit
            # strings existing in crowdin already
            REDACTABLE.each do |lab_name|
              file_name = "#{lab_name}.json"
              source_path = File.join(I18N_SOURCE_DIR_PATH, file_name)
              next unless File.exist?(source_path)

              backup_path = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME, file_name)

              FileUtils.mkdir_p(File.dirname(backup_path))
              FileUtils.cp(source_path, backup_path)

              RedactRestoreUtils.redact(source_path, source_path, REDACT_PLUGINS)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncIn.perform if __FILE__ == $0
