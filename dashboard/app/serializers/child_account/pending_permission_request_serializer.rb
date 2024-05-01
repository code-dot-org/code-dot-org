class ChildAccount::PendingPermissionRequestSerializer < ActiveModel::Serializer
  attributes :parent_email, :requested_at, :resends_sent, :consent_status

  def requested_at
    object.updated_at
  end

  def consent_status
    object.user.child_account_compliance_state
  end
end
