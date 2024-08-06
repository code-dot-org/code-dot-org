require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Apps
      module MusiclabLibraries
        DIR_NAME = 'musiclab_libraries'
        # Allows  sourcing input strings from a new version of our Music Lab
        # launch library (music-library-launch2024-v2), which will eventually
        # replace music-library-launch2024.
        LIBRARY_NAME_IN_OUT_MAPPINGS = [
          {from: 'music-library-intro2024', to: 'music-library-intro2024'},
          {from: 'music-library-launch2024-v2', to: 'music-library-launch2024'}
        ].freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_up(**opts)
          SyncUp.perform(**opts)
        end

        def self.sync_down(**opts)
          SyncDown.perform(**opts)
        end

        def self.sync_out(**opts)
          SyncOut.perform(**opts)
        end
      end
    end
  end
end

Dir[File.expand_path('../musiclab_libraries/**/*.rb', __FILE__)].sort.each {|file| require file}
