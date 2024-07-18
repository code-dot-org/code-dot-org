#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'

module I18n
  module Resources
    module Apps
      module MusiclabManifests
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths << CDO.dir(I18N_SOURCE_DIR, 'musiclab_manifests', 'music-library-intro2024.json').freeze
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabManifests::SyncUp.perform if __FILE__ == $0
