#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'
require_relative '../markdown'

module I18n
  module Resources
    module Pegasus
      module Markdown
        class SyncUp < I18n::Utils::SyncUpBase
          config.crowdin_project = 'codeorg-markdown'
          config.base_path = I18N_SOURCE_DIR_PATH
          config.source_paths << '**/*.md'
          config.ignore_paths << 'ai.md'
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Markdown::SyncUp.perform if __FILE__ == $0
