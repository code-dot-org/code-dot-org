require 'fileutils'
require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../redact_restore_utils'
require_relative '../curriculum_content'

module I18n
  module Resources
    module Dashboard
      module CurriculumContent
        module SyncIn
          def self.perform
            puts 'Sync in curriculum content'
            serialize
            redact
          end

          # Serialize all curriculum data to the I18N source directory.
          #
          # Relies heavily on the custom serializer logic defined in
          # curriculum_sync_utils/serializers to generate a hash of results with
          # translator-readable keys, rather than the basic array that is produced by
          # default.
          def self.serialize
            ::Unit.find_each do |script|
              next unless script.is_migrated?
              next unless ::ScriptConstants.i18n? script.name

              # prepare data
              # Select only lessons that pass `numbered_lesson?` for consistent `relative_position` values
              # throughout our translation pipeline
              data = ::Services::I18n::CurriculumSyncUtils::Serializers::ScriptCrowdinSerializer.new(script, scope: {only_numbered_lessons: true}).as_json.compact
              # The JSON object will have the script's crowdin_key as the top level key, but we don't
              # need that, so we will discard the crowdin_key and set data to be the object it is
              # pointing to.
              data = data.first[1] unless data.first.nil?

              # we expect that some migrated scripts won't have any lesson plan content
              # at all; that's fine, we can just skip those.
              data.compact_blank! # don't want any empty values
              next if data.blank?

              # write data to path
              name = "#{script.name}.json"
              path = File.join(I18N_SOURCE_DIR_PATH, get_script_subdirectory(script), name)
              next if I18nScriptUtils.unit_directory_change?(I18N_SOURCE_DIR_PATH, name, path)

              FileUtils.mkdir_p(File.dirname(path))
              File.write(path, JSON.pretty_generate(data))
            end
          end

          def self.redact
            originals_dir = I18N_SOURCE_DIR.sub('source', 'original')

            Dir[File.join(I18N_SOURCE_DIR_PATH, '**/*.json')].each do |file|
              original_file = file.sub(I18N_SOURCE_DIR, originals_dir)
              FileUtils.mkdir_p(File.dirname(original_file))
              FileUtils.cp(file, original_file)

              redacted = RedactRestoreUtils.redact_file(file, REDACT_RESTORE_PLUGINS)
              File.write(file, JSON.pretty_generate(redacted))
            end
          end

          # Helper method to get the desired destination subdirectory of the given
          # script for the sync in. Note this may be a nested directory like "2021/csf"
          def self.get_script_subdirectory(script)
            # special-case Hour of Code scripts.
            return 'Hour of Code' if Unit.unit_in_category?('hoc', script.name)

            # catchall for scripts without courses
            return 'other' if script.get_course_version.blank?

            # special-case CSF; we want to group all CSF courses together, even though
            # they all have different course offerings.
            return File.join(script.get_course_version.key, 'csf') if script.csf?

            # base case
            return File.join(script.get_course_version.key, script.get_course_version.course_offering.key)
          end
        end
      end
    end
  end
end
