# frozen_string_literal: true

require 'cdo/user_agent_parser'

module Services
  module AnonymousLevel
    class ClientRecording < Services::Base
      attr_reader :anon_user_id, :user_agent

      def initialize(anon_user_id:, user_agent:)
        @anon_user_id = anon_user_id
        @user_agent   = user_agent.to_s.first(1_000)
      end

      def call
        return if user_agent.blank?

        app_info = Cdo::UserAgentParser.new.parse_app(user_agent)
        return unless app_info

        ::AnonymousLevel::Client.find_or_create_by!(anon_user_id:) do |client|
          client.name           = app_info.name
          client.install_source = app_info.install_source
        end
      rescue ActiveRecord::RecordInvalid => exception
        raise unless exception.record.errors.of_kind?(:anon_user_id, :taken)
      end
    end
  end
end
