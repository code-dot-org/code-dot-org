# This concern encapsulates logic related to managing and validating a user's `username`.
# It defines validation rules for username format, length, presence, and uniqueness,
# as well as a callback to auto-generate a username during user creation when appropriate.
# It also determines when a username is required based on context (e.g., manual account creation).
module User::Username
  extend ActiveSupport::Concern

  include User::ProviderFlags

  # Username constants
  USERNAME_REGEX = /\A#{UserHelpers::USERNAME_ALLOWED_CHARACTERS.source}+\z/i

  included do
    ## Validation Macros
    validates_length_of :username, within: 5..20, allow_blank: true
    validates_format_of :username, if: :username_changed?, with: USERNAME_REGEX, allow_blank: true
    validates_uniqueness_of :username, allow_blank: true, case_sensitive: false, on: :create, if: -> {errors.blank?}
    validates_uniqueness_of :username, case_sensitive: false, on: :update, if: -> {errors.blank? && username_changed?}
    validates_presence_of :username, if: :username_required?

    ## Callback Macros
    before_validation :generate_username, on: :create
  end

  def generate_username
    # skip an expensive db query if the name is not valid anyway. we can't depend on validations being run
    return if name.blank? || email&.utf8mb4?
    self.username = UserHelpers.generate_username(User.with_deleted, name)
  end

  private def username_required?
    manual? || username_changed?
  end
end
