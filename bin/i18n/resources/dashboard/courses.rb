require 'fileutils'
require 'json'

require_relative '../../i18n_script_utils'
require_relative '../../redact_restore_utils'
require_relative '../../metrics'

module I18n
  module Resources
    module Dashboard
      module Courses
        I18N_SOURCE_FILE_PATH = CDO.dir(File.join(I18N_SOURCE_DIR, 'dashboard/courses.yml')).freeze

        # Merging dashboard/config/courses/*.course with courses.yml
        # These files contain resources used by UnitGroup (used in the landing pages of full courses).
        # https://studio.code.org/courses/csd-2021
        # All other resources used in Unit come from scrip_json files (used in the landing pages for each Unit).
        # https://studio.code.org/s/csd1-2021
        def self.sync_in
          puts 'Preparing dashboard courses'

          # Currently, csd is the only fully translatable course that has resources in this directory
          translatable_courses = %w(csd)
          resources = {}
          Dir[CDO.dir('dashboard/config/courses/*.course')].each do |file|
            course_json = JSON.load_file(file)
            course_properties = course_json['properties']

            next if course_json['resources'].empty?
            next unless translatable_courses.include?(course_properties['family_name'])

            course_json['resources'].each do |resource|
              # resoruce.rb uses Services::GloballyUniqueIdentifiers.build_resource_key to create resource keys as follow
              # resource.key / resource.course_version.course_offering.key / resource.course_version.key
              # resource_key is used to localize the resources.
              resource_key = [resource['key'], course_properties['family_name'], course_properties['version_year']].join('/')
              resources.store(resource_key, {'name' => resource['name'], 'url' => resource['url']})
            end
          end

          FileUtils.mkdir_p(File.dirname(I18N_SOURCE_FILE_PATH))
          # `dashboard/config/locales/blocks.en.yml` updates automatically from levelbuilder content
          FileUtils.cp(CDO.dir('dashboard/config/locales/courses.en.yml'), I18N_SOURCE_FILE_PATH)

          courses_yaml = YAML.load_file(I18N_SOURCE_FILE_PATH)
          courses_data = courses_yaml.dig('en', 'data')
          # Merging resources if courses already contain resources
          courses_data['resources'] ? courses_data['resources'].merge!(resources) : courses_data.store('resources', resources)

          File.write(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(courses_yaml))

          puts 'Redacting dashboard courses'
          # Save the original data, for restoration
          original = I18N_SOURCE_FILE_PATH.sub('source', 'original')
          FileUtils.mkdir_p(File.dirname(original))
          FileUtils.cp(I18N_SOURCE_FILE_PATH, original)

          # Redact the specific subset of fields within each script that we care about.
          data = YAML.load_file(I18N_SOURCE_FILE_PATH)
          data['en']['data']['course']['name'].values.each do |datum|
            markdown_data = datum.slice('description', 'student_description', 'description_student', 'description_teacher')
            redacted_data = RedactRestoreUtils.redact_data(markdown_data, %w[resourceLink vocabularyDefinition], 'md')
            datum.merge!(redacted_data)
          end

          # Overwrite source file with redacted data
          File.write(I18N_SOURCE_FILE_PATH, I18nScriptUtils.to_crowdin_yaml(data))
        end
      end
    end
  end
end
