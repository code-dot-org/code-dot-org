require 'cdo/email_validator'

module Forms
  module ChildAccount
    class ParentalPermissionRequest
      include ActiveModel::Model
      include Rails.application.routes.url_helpers

      # @params child_account [User] The child account that is requesting permission
      # @params parent_email [String] The email address of the parent or guardian
      attr_accessor :child_account, :parent_email

      validates :child_account, presence: true
      validates :parent_email, presence: true

      with_options if: -> {errors.empty?} do
        validate :parent_email_is_correct
        validate :permission_not_granted
        validate :parent_email_is_not_own
        validate :resend_limit_not_reached
        validate :daily_limit_not_reached
      end

      # @return [true, false]
      def request
        return false unless valid?

        ::ParentalPermissionRequest.transaction do
          record.resends_sent += 1 if record.persisted?
          record.save!

          ParentMailer.parent_permission_request(
            record.parent_email,
            policy_compliance_child_account_consent_url(token: record.uuid)
          ).deliver_now
        end

        true
      end

      def record
        @record ||= ::ParentalPermissionRequest.find_or_initialize_by(user: child_account, parent_email: parent_email)
      end

      private def parent_email_is_correct
        return if Cdo::EmailValidator.email_address?(parent_email)

        errors.add(:base, I18n.t('child_account.parental_permission_request.errors.invalid_parent_email'))
      end

      # If we already comply, don't suddenly invalid it
      private def permission_not_granted
        return unless Policies::ChildAccount::ComplianceState.permission_granted?(child_account)

        errors.add(:base, I18n.t('child_account.parental_permission_request.errors.already_granted'))
      end

      private def parent_email_is_not_own
        # Removes any subaddressing from the email to prevent abuse
        sanitized_parent_email = parent_email.sub(/\+[^@]+@/, '@')
        return unless child_account.hashed_email == Digest::MD5.hexdigest(sanitized_parent_email)

        errors.add(:base, I18n.t('child_account.parental_permission_request.errors.parent_email_is_own'))
      end

      private def resend_limit_not_reached
        return if record.new_record?
        return if record.resends_sent.next < Policies::ChildAccount::MAX_PARENT_PERMISSION_RESENDS

        errors.add(:base, I18n.t('child_account.parental_permission_request.errors.resend_limit_reached'))
      end

      private def daily_limit_not_reached
        return if record.persisted?

        max_daily_requests = Policies::ChildAccount::MAX_STUDENT_DAILY_PARENT_PERMISSION_REQUESTS
        today_requests = ::ParentalPermissionRequest.where(user: child_account, created_at: Time.zone.now.all_day)
        return unless today_requests.limit(max_daily_requests).count == max_daily_requests

        errors.add(:base, I18n.t('child_account.parental_permission_request.errors.daily_limit_reached'))
      end
    end
  end
end
