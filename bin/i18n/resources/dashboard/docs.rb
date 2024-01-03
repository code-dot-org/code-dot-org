require_relative '../../i18n_script_utils'
require_relative '../dashboard'

Dir[File.expand_path('../docs/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Dashboard
      module Docs
        # TODO: Adding spritelab and Javalab to translation pipeline
        # Currently supporting translations for applab, gamelab and weblab. NOT translating javalab and spritelab.
        # Javalab documentations exists in a different table because it has a different structure, more align with java.
        # Spritelab uses translatable block names, unlike JavaScript blocks.
        TRANSLATABLE_PROGRAMMING_ENVS = %w[applab gamelab weblab].freeze

        DIR_NAME = 'docs'.freeze
        I18N_SOURCE_DIR_PATH = CDO.dir(I18N_SOURCE_DIR, DIR_NAME).freeze
        I18N_BACKUP_DIR_PATH = CDO.dir(I18N_ORIGINAL_DIR, DIR_NAME).freeze
        REDACT_PLUGINS = %w[visualCodeBlock link resourceLink].freeze

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
