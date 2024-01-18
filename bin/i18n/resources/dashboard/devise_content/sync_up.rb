#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../devise_content'

module I18n
  module Resources
    module Dashboard
      module DeviseContent
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << I18N_SOURCE_FILE_PATH
        end
      end
    end
  end
end

I18n::Resources::Dashboard::DeviseContent::SyncUp.perform if __FILE__ == $0
