#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../docs'

module I18n
  module Resources
    module Dashboard
      module Docs
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << File.join(I18N_SOURCE_DIR_PATH, '**/*.{json,yml}')
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Docs::SyncUp.perform if __FILE__ == $0
