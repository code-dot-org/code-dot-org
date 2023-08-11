require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'
require_relative '../../metrics'

module I18n
  module Resources
    module Dashboard
      module Blocks
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard/blocks.yml')).freeze

        # Pull in various fields for custom blocks from .json files and save them to blocks.en.yml
        def self.sync_in
          puts 'Preparing blocks content'

          blocks = {}

          Dir[CDO.dir('dashboard/config/blocks/**/*.json')].each do |file|
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

          dashboard_i18n_file_path = CDO.dir('dashboard/config/locales/blocks.en.yml')
          File.write(dashboard_i18n_file_path, I18nScriptUtils.to_crowdin_yaml({'en' => {'data' => {'blocks' => blocks}}}))
          FileUtils.mkdir_p(File.dirname(I18N_SOURCE_FILE_PATH))
          FileUtils.cp(dashboard_i18n_file_path, I18N_SOURCE_FILE_PATH)

          puts 'Redacting blocks content'
          backup = I18N_SOURCE_FILE_PATH.sub('source', 'original')
          FileUtils.mkdir_p(File.dirname(backup))
          FileUtils.cp(I18N_SOURCE_FILE_PATH, backup)
          RedactRestoreUtils.redact(I18N_SOURCE_FILE_PATH, I18N_SOURCE_FILE_PATH, %w[blockfield], 'txt')
        end
      end
    end
  end
end
