require 'policies/lti'

module InitialSectionCreationInterstitialHelper
  # Determine whether or not to show the initial section creation interstitial popup to a user
  # This interstitial should be shown only to teachers on their first sign-in
  def self.show?(user, showing_gdpr = false)
    return false if user.nil?
    return false unless user.teacher?
    return false if Policies::Lti.lti?(user)
    # Don't show popup if user is also being shown the GDPR modal to avoid overlap.
    return false if showing_gdpr

    return user.sign_in_count <= 1
  end
end
