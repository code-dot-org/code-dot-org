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
            progress_bar.progress = 100
          end

          private def prepare_i18n_source_files
            Dir.glob(CDO.dir('apps/i18n/**/en_us.json')) do |filepath|
              lab_name = File.basename(File.dirname(filepath))
              next if EXTERNAL_LABS.include?(lab_name)
              I18nScriptUtils.copy_file(filepath, File.join(I18N_SOURCE_DIR_PATH, "#{lab_name}.json"))
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncIn.perform if __FILE__ == $0
