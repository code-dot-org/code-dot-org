#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../course_offerings'

module I18n
  module Resources
    module Dashboard
      module CourseOfferings
        class SyncIn
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.write_file(I18N_SOURCE_FILE_PATH, JSON.pretty_generate(i18n_data))

            progress_bar.finish
          end

          private

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(title: 'Dashboard/course_offerings sync-in')
          end

          def i18n_data
            CourseOffering.find_each.each_with_object({}) do |course_offering, i18n_data|
              i18n_data[course_offering.key] = course_offering.display_name
            end.sort.to_h
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::CourseOfferings::SyncIn.perform if __FILE__ == $0
