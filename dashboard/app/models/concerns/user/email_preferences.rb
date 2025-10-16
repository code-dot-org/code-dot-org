# This concern encapsulates logic related to saving and managing a User's email opt-in preferences.
# It delegates storage to the EmailPreference model and handles different opt-in scenarios, such as
# parental email consent, regional partner contact permissions, and form-based email subscriptions.
# - Not responsible for persisting data directly; uses EmailPreference.upsert! or User updates.
module User::EmailPreferences
  extend ActiveSupport::Concern

  included do
    ## Validation Macros
    validates_presence_of :email_preference_opt_in, if: :email_preference_opt_in_required
    validates_presence_of :email_preference_request_ip, if: -> {email_preference_opt_in.present?}
    validates_presence_of :email_preference_source, if: -> {email_preference_opt_in.present?}
    validates_presence_of :email_preference_form_kind, if: -> {email_preference_opt_in.present?}

    # Validations for adding parent email notifications
    validates_inclusion_of :parent_email_preference_opt_in, in: %w(yes no), if: :parent_email_preference_opt_in_required?
    validates_presence_of :parent_email_preference_email, if: :parent_email_preference_opt_in_required?
    validates_presence_of :parent_email_preference_request_ip, if: :parent_email_preference_opt_in_required?
    validates_presence_of :parent_email_preference_source, if: :parent_email_preference_opt_in_required?

    ## Callback Macros
    before_validation :parent_email_preference_setup, if: -> {parent_email_preference_opt_in_required? || parent_email_update_only?}
    after_save :save_email_preference, if: -> {email_preference_opt_in.present?}
    after_save :save_parent_email_preference, if: :parent_email_preference_opt_in_required?
    after_save :save_email_reg_partner_preference, if: -> {share_teacher_email_reg_partner_opt_in_radio_choice.present?}
  end

  def save_email_preference
    if teacher?
      EmailPreference.upsert!(
        email: email,
        opt_in: email_preference_opt_in.casecmp?("yes"),
        ip_address: email_preference_request_ip,
        source: email_preference_source,
        form_kind: email_preference_form_kind,
        )
    end
  end

  # Enables/disables email notifications for the parent.
  def save_parent_email_preference
    if student? && parent_email.present?
      EmailPreference.upsert!(
        email: parent_email,
        opt_in: parent_email_preference_opt_in.casecmp?("yes"),
        ip_address: parent_email_preference_request_ip,
        source: parent_email_preference_source,
        form_kind: nil
      )
    end
  end

  # Enables/disables sharing of emails of teachers in the U.S. to Code.org regional partners based on user's choice.
  def save_email_reg_partner_preference
    user = User.find_by_email_or_hashed_email(email)
    if teacher? && share_teacher_email_reg_partner_opt_in_radio_choice.casecmp?("yes")
      user.share_teacher_email_regional_partner_opt_in = DateTime.now
      user.save!
    end
  end

  def parent_email_update_only?
    parent_email_update_only == '1' && user_type == 'student'
  end

  def parent_email_preference_opt_in_required?
    # parent_email_preference_opt_in_required is a checkbox which either has the value '0' or '1'
    # user_type 'student' is the only type which supports have a parent_email associated with it.
    parent_email_preference_opt_in_required == '1' && user_type == 'student'
  end

  def parent_email_preference_setup
    self.parent_email = parent_email_preference_email
  end
end
