require_relative 'course_content/sync_in'

module I18n
  module Resources
    module Dashboard
      module CourseContent
        def self.sync_in
          SyncIn.perform
        end
      end
    end
  end
end
