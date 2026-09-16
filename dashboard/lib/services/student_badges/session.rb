require 'policies/student_badges'

module Services
  module StudentBadges
    module Session
      KEY = 'student_badge'.freeze

      def self.provenance(badge)
        {id: badge.id, user_id: badge.user_id, generation: badge.generation,
         authenticated_at: Time.current.to_i, last_activity_at: Time.current.to_i}.stringify_keys
      end

      def self.valid?(session)
        data = session[KEY]
        return false unless data.is_a?(Hash) && Policies::StudentBadges.authentication_enabled?
        return false unless session.dig('warden.user.user.key', 0, 0) == data['user_id']
        now = Time.current.to_i
        return false unless data['authenticated_at'].is_a?(Integer) && data['last_activity_at'].is_a?(Integer)
        return false unless now < data['authenticated_at'] + Policies::StudentBadges::ABSOLUTE_TIMEOUT
        return false unless now < data['last_activity_at'] + Policies::StudentBadges::IDLE_TIMEOUT

        StudentLoginBadge.on_primary do
          badge = StudentLoginBadge.find_by(id: data['id'], user_id: data['user_id'], generation: data['generation'])
          badge&.usable? || false
        end
      end
    end
  end
end
