module RaceInterstitialHelper
  # Determine whether or not to show the race interstitial popup to a user
  def self.show_race_interstitial?(user, request_ip = nil)
    return false if user.teacher?
    return false if user.under_13?
    return false if user.account_age_days < 7
    # If there is race information at all, that means we shouldn't show the dialog
    return false if user.races && !user.races.empty?

    # Restrict to US, if we have an IP
    if defined?(request_ip) && !request_ip.nil?
      location = Geocoder.search(request_ip).first
      return false if location && location.country_code.to_s.downcase != 'us'
    end

    return true
  end
end
