module GdprDialogHelper
  def self.show?(user, request)
    return false if user.data_transfer_agreement_accepted == true

    return true if request.params['force_in_eu'].present?
    return true if request.gdpr?

    return false
  end
end
