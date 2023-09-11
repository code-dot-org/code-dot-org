require_relative '../../i18n_script_utils'

Dir[File.expand_path('../labs/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      module Labs
        DIR_NAME = 'blockly-mooc'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        UNTRANSLATABLE_LABS = %w[calc eval netsim].freeze
        REDACTABLE = %w[applab gamelab weblab].freeze
        REDACT_PLUGINS = %w[link].freeze

        def self.sync_in
          SyncIn.perform
        end

        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end
