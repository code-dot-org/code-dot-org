module InitialSectionCreationInterstitialHelper
  # Determine whether or not to show the initial section creation interstitial popup to a user
  # This interstitial should be shown only to teachers on their first sign-in
  def self.show?(user)
    return false if user.nil?
    return false unless user.teacher?

    return user.sign_in_count <= 1
  end
end
