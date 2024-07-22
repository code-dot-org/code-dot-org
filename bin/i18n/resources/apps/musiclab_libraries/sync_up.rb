#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_up_base'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        class SyncUp < I18n::Utils::SyncUpBase
          config.source_paths.push(
            CDO.dir(I18N_SOURCE_DIR, 'musiclab_libraries', 'music-library-intro2024.json'),
            CDO.dir(I18N_SOURCE_DIR, 'musiclab_libraries', 'music-library-launch2024.json')
          )
        end
      end
    end
  end
end

I18n::Resources::Apps::MusiclabLibraries::SyncUp.perform if __FILE__ == $0
