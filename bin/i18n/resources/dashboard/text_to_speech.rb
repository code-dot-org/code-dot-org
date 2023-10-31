require_relative '../../i18n_script_utils'
require_relative '../dashboard'

Dir[File.expand_path('../text_to_speech/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module TextToSpeech
        def self.sync_out
          SyncOut.perform
        end
      end
    end
  end
end
