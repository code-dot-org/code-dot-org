#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../blocks'

module I18n
  module Resources
    module Dashboard
      module Blocks
        class SyncIn
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            prepare
            progress_bar.progress = 50

            redact

            progress_bar.finish
          end

          private

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(title: 'Dashboard/blocks sync-in')
          end

          def blocks_data
            Dir.glob(CDO.dir('dashboard/config/blocks/**/*.json')).each_with_object({}) do |file_path, blocks|
              config = JSON.load_file(file_path)['config']
              block_name = File.basename(file_path, '.*')
              blocks[block_name] = {}

              blocks[block_name]['text'] = config['blockText']
              next unless config['args']

              blocks[block_name]['options'] = config['args'].each_with_object({}) do |arg, args_options|
                next if arg['options'].nil? || arg['options'].empty?

                args_options[arg['name']] = arg['options'].each_with_object({}) do |option_tuple, arg_options|
                  arg_options[option_tuple.last] = option_tuple.first
                end
              end

              blocks[block_name].delete('options') if blocks[block_name]['options'].empty?
            end
          end

          def i18n_data
            {
              'en' => {
                'data' => {
                  'blocks' => blocks_data
                }
              }
            }
          end

          def prepare
            I18nScriptUtils.write_file(ORIGIN_I18N_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(i18n_data))
            I18nScriptUtils.copy_file(ORIGIN_I18N_FILE_PATH, I18N_SOURCE_FILE_PATH)
          end

          def redact
            I18nScriptUtils.copy_file(I18N_SOURCE_FILE_PATH, I18N_BACKUP_FILE_PATH)
            RedactRestoreUtils.redact(I18N_SOURCE_FILE_PATH, I18N_SOURCE_FILE_PATH, REDACT_PLUGINS, REDACT_FORMAT)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Blocks::SyncIn.perform if __FILE__ == $0
