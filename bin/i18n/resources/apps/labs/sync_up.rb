#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../labs'

module I18n
  module Resources
    module Apps
      module Labs
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << File.join(I18N_SOURCE_DIR_PATH, '**/*.json')
          config.ignore_paths << File.join(I18N_SOURCE_DIR_PATH, "**/mlPlayground.json")
          config.ignore_paths << File.join(I18N_SOURCE_DIR_PATH, "**/{#{UNTRANSLATABLE_LABS.join(',')}}.json")
        end
      end
    end
  end
end

I18n::Resources::Apps::Labs::SyncUp.perform if __FILE__ == $0
