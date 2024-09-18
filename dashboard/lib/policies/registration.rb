class Policies::Registration
  NEW_USER_PERMITTED_PARAMS = [
    :user_type,
    :email,
    :name,
    :email_preference_opt_in_required,
    :email_preference_opt_in,
    :email_preference_request_ip,
    :email_preference_source,
    :email_preference_form_kind,
    :school,
    :school_info_id,
    :age,
    :parent_email_preference_email,
    :parent_email_preference_opt_in,
    :parent_email_preference_request_ip,
    :parent_email_preference_source,
    :data_transfer_agreement_accepted,
    :data_transfer_agreement_required,
    :data_transfer_agreement_request_ip,
    :data_transfer_agreement_source,
    :data_transfer_agreement_kind,
    :data_transfer_agreement_at
  ].freeze
end
