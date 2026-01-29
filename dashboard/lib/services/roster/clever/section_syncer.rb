# frozen_string_literal: true

module Services
  module Roster
    module Clever
      class SectionSyncer < Services::Base
        attr_reader :teacher, :section

        # @param teacher [Teacher] Initiator of the sync
        # @param section [CleverSection] Section to be synced
        def initialize(teacher:, section:)
          @teacher = teacher
          @section = section
        end

        # @return [OmniAuthSection] Synchronized section
        def call
          clever_students = clever_client.get("sections/#{section.clever_id}/students").fetch('data')
          CleverSection.from_service(section.clever_id, teacher.id, clever_students, section.name)
        end

        private def oauth_token
          @oauth_token ||= teacher.oauth_tokens_for_provider(AuthenticationOption::CLEVER).try(:[], :oauth_token)
        end

        private def clever_client
          @clever_client ||= Clients::CleverRest.new(oauth_token:)
        end
      end
    end
  end
end
