module RaceInterstitialHelper
  # Determine whether or not to show the race interstitial popup to a user
  def self.show?(user)
    return false if user.nil?
    return false if user.races
    return false if user.teacher?
    return false if user.under_13?

    # Covers test cases if we don't have sign in records for a user
    return false if user.days_since_first_sign_in.nil?
    # Covers actual behavior we want in our application
    return false if user.days_since_first_sign_in < 7

    # Restrict to cases where we can successfully geolocate to the US
    return false if user.current_sign_in_ip.nil?
    location = Geocoder.search(user.current_sign_in_ip).first
    return false unless location
    return false if location.country_code.to_s.downcase != 'us'

    return true
  end
end
