module Services
  module User
    class UpgradePersonalLogin
      attr_reader :user, :params

      def initialize(user:, params:)
        @user = user
        @params = params.dup
      end

      def call
        return false unless user.student?

        if user.secret_word_account? && !user.valid_secret_words?(params[:secret_words])
          error = params[:secret_words].blank? ? :blank_plural : :invalid_plural
          user.errors.add(:secret_words, error)
          return false
        end

        unless user.migrated?
          params[:provider] = nil
          return user.update(params.except(:secret_words))
        end

        user.transaction do
          update_contact_info if contact_info_present?
          user.update!(params.except(:secret_words, :email, :hashed_email))
        end
        true
      rescue
        false
      end

      private def contact_info_present?
        params[:email].present? || params[:hashed_email].present?
      end

      private def update_contact_info
        user.update_primary_contact_info!(
          new_email: params[:email],
          new_hashed_email: params[:hashed_email]
        )
      end
    end
  end
end
