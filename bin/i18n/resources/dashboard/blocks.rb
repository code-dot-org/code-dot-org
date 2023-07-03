require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'

module I18n
  module Resources
    module Dashboard
      module Blocks
        SYNC_IN_SOURCE_FILES_PATH = CDO.dir(File.join(DASHBOARD_BLOCKS_DIR, '**/*.json')).freeze
        DASHBOARD_I18N_FILE_PATH = CDO.dir(File.join(DASHBOARD_I18N_DIR, 'blocks.en.yml')).freeze
        SYNC_IN_RESULT_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DASHBOARD_DIR, 'blocks.yml')).freeze

        def self.sync_in
          prepare
          redact
        end

        # Pull in various fields for custom blocks from .json files and save them to blocks.en.yml
        def self.prepare
          puts 'Preparing block content'

          blocks = {}

          Dir[SYNC_IN_SOURCE_FILES_PATH].each do |file|
            name = File.basename(file, '.*')
            config = JSON.parse(File.read(file))['config']
            blocks[name] = {
              'text' => config['blockText'],
            }

            next unless config['args']

            args_with_options = {}
            config['args'].each do |arg|
              next if !arg['options'] || arg['options'].empty?

              options = args_with_options[arg['name']] = {}
              arg['options'].each do |option_tuple|
                options[option_tuple.last] = option_tuple.first
              end
            end
            blocks[name]['options'] = args_with_options unless args_with_options.empty?
          end

          File.write(DASHBOARD_I18N_FILE_PATH, I18nScriptUtils.to_crowdin_yaml({'en' => {'data' => {'blocks' => blocks}}}))
          FileUtils.mkdir_p(CDO.dir(I18N_SOURCE_DASHBOARD_DIR))
          FileUtils.cp(DASHBOARD_I18N_FILE_PATH, SYNC_IN_RESULT_FILE_PATH)
        end

        def self.redact
          puts 'Redacting block content'

          source = SYNC_IN_RESULT_FILE_PATH
          backup = source.sub('source', 'original')

          FileUtils.mkdir_p(File.dirname(backup))
          FileUtils.cp(source, backup)

          RedactRestoreUtils.redact(source, source, %w[blockfield], 'txt')
        end
      end
    end
  end
end
