#!/usr/bin/env ruby

require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../redact_restore_utils'
require_relative '../courses'

module I18n
  module Resources
    module Dashboard
      module Courses
        class SyncIn < I18n::Utils::SyncInBase
          def process
            prepare
            redact
          end

          private

          def resources_i18n_data
            Dir.glob(CDO.dir('dashboard/config/courses/*.course')).each_with_object({}) do |file_path, i18n_data|
              course_data = JSON.load_file(file_path)
              next if course_data['resources'].nil? || course_data['resources'].empty?

              course_properties = course_data['properties']
              next unless TRANSLATABLE_COURSES.include?(course_properties['family_name'])

              course_data['resources'].each do |resource|
                # resource.rb uses Services::GloballyUniqueIdentifiers.build_resource_key to create resource keys as follow
                # resource.key / resource.course_version.course_offering.key / resource.course_version.key
                # resource_key is used to localize the resources.
                resource_key = [
                  resource['key'],
                  course_properties['family_name'],
                  course_properties['version_year']
                ].join('/')

                i18n_data.store(resource_key, resource.slice('name', 'url'))
              end
            end
          end

          # Merging dashboard/config/courses/*.course with courses.yml
          # These files contain resources used by UnitGroup (used in the landing pages of full courses).
          # https://studio.code.org/courses/csd-2021
          # All other resources used in Unit come from scrip_json files (used in the landing pages for each Unit).
          # https://studio.code.org/s/csd1-2021
          def prepare
            i18n_data = YAML.load_file(ORIGIN_I18N_FILE_PATH)

            courses_data = i18n_data.dig('en', 'data')
            courses_data['resources'] ||= {}
            courses_data['resources'].merge!(resources_i18n_data)

            I18nScriptUtils.write_file(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(i18n_data))
          end

          def redact
            # Save the original data, for restoration
            I18nScriptUtils.copy_file(I18N_SOURCE_FILE_PATH, I18N_BACKUP_FILE_PATH)

            i18n_data = YAML.load_file(I18N_SOURCE_FILE_PATH)
            # Redact the specific subset of fields within each script that we care about.
            i18n_data.dig('en', 'data', 'course', 'name').values.each do |course_data|
              markdown_data = course_data.slice('description', 'student_description', 'description_student', 'description_teacher')
              redacted_data = RedactRestoreUtils.redact_data(markdown_data, REDACT_PLUGINS, REDACT_FORMAT)
              course_data.merge!(redacted_data)
            end

            # Overwrite source file with redacted data
            I18nScriptUtils.write_file(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(i18n_data))
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::Courses::SyncIn.perform if __FILE__ == $0
