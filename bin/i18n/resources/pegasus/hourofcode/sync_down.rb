#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_down_base'
require_relative '../hourofcode'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        class SyncDown < I18n::Utils::SyncDownBase
          config.crowdin_project = CROWDIN_PROJECT
          config.download_paths << DownloadPath.new(dest_subdir: DIR_NAME)
        end
      end
    end
  end
end

I18n::Resources::Pegasus::HourOfCode::SyncDown.perform if __FILE__ == $0
