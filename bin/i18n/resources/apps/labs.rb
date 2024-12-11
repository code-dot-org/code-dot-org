require_relative '../../i18n_script_utils'

module I18n
  module Resources
    module Apps
      module Labs
        DIR_NAME = 'labs'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(SOURCE_APPS_DIR, DIR_NAME).freeze
        I18N_BACKUP_DIR_PATH = CDO.dir(ORIGINAL_APPS_DIR, DIR_NAME).freeze
        UNTRANSLATABLE_LABS = %w[calc eval netsim].freeze
        REDACTABLE_LABS = %w[applab gamelab weblab].freeze
        EXTERNAL_LABS = %w[fish mlPlayground].freeze
        REDACT_PLUGINS = %w[link].freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_up(**opts)
          SyncUp.perform(**opts)
        end

        def self.sync_down(**opts)
          SyncDown.perform(**opts)
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end

Dir[File.expand_path('../labs/**/*.rb', __FILE__)].sort.each {|file| require file}
