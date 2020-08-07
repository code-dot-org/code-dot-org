module ThankDonorsInterstitialHelper
  # Determine whether or not to show the thank donors interstitial popup to a user
  # We only show the interstitial to signed in users on their first login,
  # and also do not want to show it when it might conflict with other dialogs.
  def self.show?(user, request)
    return false if user.nil?
    return false unless user.sign_in_count == 1
    return false if user.age.nil? # Age dialog
    return false if user && user.teacher? && !user.accepted_latest_terms? # Terms of Service dialog
    return false if GdprDialogHelper.show?(user, request)

    return true
  end
end
