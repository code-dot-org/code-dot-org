#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/malformed_i18n_reporter'
require_relative '../course_content'

module I18n
  module Resources
    module Dashboard
      module CourseContent
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            distribute_level_content(language)
            distribute_localization_of(BLOCK_CATEGORIES_TYPE, language)
            distribute_localization_of(PARAMETER_NAMES_TYPE, language)
            distribute_localization_of(PROGRESSIONS_TYPE, language)
            distribute_localization_of(VARIABLE_NAMES_TYPE, language)
          end

          private

          def dashboard_i18n_file_path(type, i18n_locale, extension)
            File.join(ORIGIN_I18N_DIR_PATH, "#{type}.#{i18n_locale}.#{extension}")
          end

          def restore_level_content(file_subpath, crowdin_file_path)
            original_file_path = File.join(I18N_BACKUP_DIR_PATH, file_subpath)
            return false unless File.exist?(original_file_path)

            # Course content should be merged with existing content, so existing data doesn't get lost
            restored_i18n_file = RedactRestoreUtils.restore_file(original_file_path, crowdin_file_path, REDACT_PLUGINS)
            restored_i18n_data = JSON.parse(restored_i18n_file)
            i18n_data = JSON.load_file(crowdin_file_path)
            File.write(crowdin_file_path, JSON.pretty_generate(i18n_data.deep_merge(restored_i18n_data)))

            true
          end

          def level_types_i18n_data(level, level_i18n_data)
            result = {}

            if level_i18n_data.key?('sublevels')
              sublevel_content = level_i18n_data.delete('sublevels')
              sublevel_content.each do |sublevel_name, sublevel_i18n_data|
                sublevel = Level.find_by_name(sublevel_name)
                next unless sublevel

                result.deep_merge! level_types_i18n_data(sublevel, sublevel_i18n_data)
              end
            end

            if level_i18n_data.key?('contained levels')
              contained_levels_i18n_data = level_i18n_data.delete('contained levels')
              unless contained_levels_i18n_data.blank?
                level.contained_levels.zip(contained_levels_i18n_data).each do |contained_level, contained_level_i18n_data|
                  result.deep_merge! level_types_i18n_data(contained_level, contained_level_i18n_data)
                end
              end
            end

            level_i18n_data.each do |type, type_i18n_data|
              result[type] ||= {}
              result[type][level.name] = type_i18n_data
            end

            result
          end

          def i18n_data_of(language, crowdin_locale_dir)
            malformed_i18n_reporter = I18n::Utils::MalformedI18nReporter.new(language[:locale_s])

            crowdin_files = Dir.glob('**/*.json', base: crowdin_locale_dir)
            progress_bar.total += crowdin_files.size

            crowdin_files.each_with_object({}) do |file_subpath, types_i18n_data|
              crowdin_file_path = File.join(crowdin_locale_dir, file_subpath)

              # Only level content are redacted, see `SyncIn#redact_level_content`
              level_content_restored = restore_level_content(file_subpath, crowdin_file_path)
              # Redacted i18n files that haven't been restored shouldn't be distributed
              next unless level_content_restored

              # collects malformed i18n strings from the Crowdin file
              malformed_i18n_reporter.process_file(crowdin_file_path)

              crowdin_i18n_data = JSON.load_file(crowdin_file_path)
              crowdin_i18n_data&.each do |level_url, level_i18n_data|
                level = mutex.synchronize {I18nScriptUtils.get_level_from_url(level_url)}
                next unless level

                types_i18n_data.deep_merge! level_types_i18n_data(level, level_i18n_data)
              end
            ensure
              mutex.synchronize {progress_bar.increment}
            end
          ensure
            malformed_i18n_reporter.report
          end

          # Consumes translations from the JSON files in course_content for the given
          # locale and updates the appropriate YAML files in dashboard/config/locales.
          #
          # Note that the JSON files are organized by script and level and the YAML files
          # are organized by property name (long_instructions, display_name, etc), so
          # a little transformation is involved.
          #
          # Note also that this distribution merges new strings with the old. In other
          # words, it will capture new strings and updates to existing strings, but it
          # will  not remove strings. We do this because in order to take advantage of
          # the list of changes generated by the sync down, we want to be able to skip
          # over parsing unchanged strings, and if we skipped strings without doing a
          # merge we'd end up deleting any unchanged strings.
          def distribute_level_content(language)
            crowdin_locale_dir = I18nScriptUtils.crowdin_locale_dir(language[:locale_s], DIR_NAME)
            return unless File.directory?(crowdin_locale_dir)

            i18n_data = i18n_data_of(language, crowdin_locale_dir) || {}

            i18n_locale_dir = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_locale_dir, i18n_locale_dir)

            i18n_data.each do |type, type_i18n_data|
              # We'd like in the long term for all of our generated course content locale
              # files to be in JSON rather than YAML. As a first step on that journey,
              # here we serialize all of the locale types except DSLs to JSON. The DSL
              # locale file is unfortunately touched by a few other processes, so
              # converting that one over will have to be done as part of a larger effort.
              extension = type == 'dsls' ? 'yml' : 'json'
              target_i18n_file_path = dashboard_i18n_file_path(type, language[:locale_s], extension)

              if File.exist?(target_i18n_file_path)
                existing_i18n_data = I18nScriptUtils.parse_file(target_i18n_file_path) || {}
                existing_type_i18n_data = existing_i18n_data.dig(language[:locale_s], 'data', type) || {}
                type_i18n_data = existing_type_i18n_data.deep_merge(type_i18n_data.sort.to_h)
              end

              dashboard_i18n_data = I18nScriptUtils.to_dashboard_i18n_data(language[:locale_s], type, type_i18n_data)
              I18nScriptUtils.sanitize_data_and_write(dashboard_i18n_data, target_i18n_file_path)
            end
          end

          def distribute_localization_of(type, language)
            crowdin_file_path = I18nScriptUtils.crowdin_locale_dir(language[:locale_s], I18n::Resources::Dashboard::DIR_NAME, "#{type}.yml")
            return unless File.exist?(crowdin_file_path)

            target_i18n_file_path = dashboard_i18n_file_path(type, language[:locale_s], 'yml')
            I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, target_i18n_file_path)

            i18n_file_path = I18nScriptUtils.locale_dir(language[:locale_s], I18n::Resources::Dashboard::DIR_NAME, "#{type}.yml")
            I18nScriptUtils.move_file(crowdin_file_path, i18n_file_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseContent::SyncOut.perform if __FILE__ == $0
