require 'metrics/events'
require 'policies/lti'

module Services
  module Lti
    class AccountUnlinker < Services::Base
      attr_reader :user, :auth_option, :issuer, :client_id, :sub

      def initialize(user:, auth_option:)
        @user = user
        @auth_option = auth_option
        auth_id_components = auth_option.authentication_id.split('|')
        @issuer = auth_id_components[0]
        @client_id = auth_id_components[1]
        @sub = auth_id_components[2]
      end

      def call
        return unless user.authentication_options.include?(auth_option)

        ActiveRecord::Base.transaction do
          raise Exception.new('Cannot unlink user\'s only authentication option') if Policies::Lti.only_lti_auth?(user)
          remove_lti_user_identity
          auth_option.destroy!
          promote_coteachers if user.teacher?
        end

        Metrics::Events.log_event(
          user: user,
          event_name: 'lti_account_unlinked',
          metadata: {
            lms_name: lti_integration.platform_name,
            user_type: user.user_type,
          }
        )
      end

      private def lti_integration
        @lti_integration ||= Queries::Lti.get_lti_integration(issuer, client_id)
      end

      private def remove_lti_user_identity
        user.lti_user_identities.find_by(lti_integration_id: lti_integration.id, subject: sub)&.destroy
      end

      private def promote_coteachers
        user.sections_owned.each do |section|
          next if section.instructors.count == 1
          next if section&.lti_section.blank?
          next if section.lti_course.lti_integration.id != lti_integration.id
          coteacher_to_promote = section.instructors.find {|instructor| instructor.id != user.id}
          section.update!(user_id: coteacher_to_promote.id)
        end
      end
    end
  end
end
