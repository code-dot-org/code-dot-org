require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'

module I18n
  module Resources
    module Apps
      module Labs
        I18N_SOURCE_DIR_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'blockly-mooc')).freeze

        def self.sync_in
          puts 'Preparing *labs files'
          FileUtils.mkdir_p(I18N_SOURCE_DIR_PATH)

          Dir[CDO.dir('apps/i18n/**/en_us.json')].each do |filepath|
            FileUtils.cp(filepath, File.join(I18N_SOURCE_DIR_PATH, "#{filepath.split('/')[-2]}.json"))
          end

          puts 'Redacting *labs content'
          # Only CSD labs are redacted, since other labs were already part of the i18n pipeline and redaction would edit
          # strings existing in crowdin already
          redactable_labs = %w[applab gamelab weblab]

          redactable_labs.each do |lab_name|
            source_path = File.join(I18N_SOURCE_DIR_PATH, "#{lab_name}.json")
            backup_path = source_path.sub('source', 'original')

            FileUtils.mkdir_p(File.dirname(backup_path))
            FileUtils.cp(source_path, backup_path)

            RedactRestoreUtils.redact(source_path, source_path, %w[link])
          end
        end
      end
    end
  end
end
