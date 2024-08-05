require 'metrics/events'

module Lti
  module V1
    class SectionsController < ApplicationController
      before_action :authenticate_user!

      def bulk_update_owners
        section_owners = JSON.parse(params.require(:section_owners))
        ActiveRecord::Base.transaction do
          section_owners.each do |lti_section_id, owner_id|
            section = LtiSection.find_by(id: lti_section_id)&.section
            unless section
              render :not_found
              raise ActiveRecord::Rollback
            end
            authorize! :manage, section
            next if section.user_id == owner_id
            metadata = {
              section_id: section.id,
              previous_owner_id: section.user_id,
              new_owner_id: owner_id,
              lms_name: section&.lti_course&.lti_integration&.platform_name,
            }
            section.update!(user_id: owner_id)
            Metrics::Events.log_event(
              user: current_user,
              event_name: 'lti_section_owner_changed',
              metadata: metadata
            )
          end
        end
        head :ok
      end
    end
  end
end
