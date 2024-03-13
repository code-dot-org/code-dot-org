#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../hourofcode'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        class SyncUp < I18n::Utils::SyncUpBase
          config.crowdin_project = 'hour-of-code'
          config.base_path = I18N_SOURCE_DIR_PATH
          config.source_paths << 'en.yml'
          config.source_paths << '**/*.md'
        end
      end
    end
  end
end

I18n::Resources::Pegasus::HourOfCode::SyncUp.perform if __FILE__ == $0
