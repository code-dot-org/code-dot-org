require 'contentful'

module Services
  module Marketing
    class TeacherDashboard < Services::Base
      def initialize(current_user)
        @user = current_user
      end

      def call
      end
    end
  end
end
