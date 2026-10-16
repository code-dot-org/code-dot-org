module Services
  module TeacherDirectoryVerification
    class Discovery
      FEATURE_FLAGS = %w(
        teacher_directory_verification_enabled
        teacher_directory_verification_discovery_enabled
        teacher_directory_verification_email_enabled
        teacher_directory_verification_zendesk_enabled
      ).freeze

      def self.enabled?
        FEATURE_FLAGS.all? {|flag| DCDO.get(flag, false) == true}
      end

      def self.enqueue_for(user)
        return unless enabled? && eligible_user?(user)

        job = ::TeacherDirectoryVerification::DiscoverJob.perform_later(user.id)
        unless job
          Observability::Errors.report(
            RuntimeError.new('Teacher directory verification discovery job was not enqueued'),
            error_message: 'Could not enqueue teacher directory verification discovery',
          )
        end
      rescue StandardError => exception
        Observability::Errors.report(exception, error_message: 'Could not enqueue teacher directory verification discovery')
      end

      def self.eligible_user?(user)
        return false unless user&.teacher? && !user.verified_teacher?
        return false if user.email.blank?

        school_info = user.school_info
        school_info&.school.present? && school_info.school_id.to_s == school_info.school.id.to_s
      end
    end
  end
end
