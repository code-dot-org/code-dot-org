module RaceInterstitialHelper
  # Determine whether or not to show the race interstitial popup to a user
  def self.show_race_interstitial?(user)
    if user.teacher?
      return false
    end
    if user.under_13?
      return false
    end
    if user.account_age_days < 7
      return false
    end
    # If there is race information at all, that means we shouldn't show the dialog
    if user.races && !user.races.empty?
      return false
    end
    if defined?(request)
      location = Geocoder.search(request.ip).first
      if location && location.country_code.to_s.downcase != 'us'
        return false
      end
    end

    return true
  end
end
