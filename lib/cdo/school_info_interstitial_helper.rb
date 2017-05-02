module SchoolInfoInterstitialHelper
  def self.show_school_info_interstitial?(user)
    return false unless user.teacher?
    return false if user.account_age_days < 30 # at least a 30 day cooldown on showing the interstitial

    school_info = user.school_info

    # Interstitial should pop up the first time for the teacher if it has been at least 30 days since the teacher signed
    # up for an account AND the teacher hasn’t previously filled out all the fields already (e.g. as part
    # of workshop registration).

    return false if school_info.complete?

    if user.last_seen_school_info_interstitial
      days_since_interstitial_seen = (DateTime.now - user.last_seen_school_info_interstitial.to_datetime).to_i
      return false if days_since_interstitial_seen < 30
    end

    # Restrict to cases where we can successfully geolocate to the US
    # return false if request_ip.nil?
    # location = Geocoder.search(request_ip).first
    # return false unless location
    # return false if location.country_code.to_s.downcase != 'us'

    user.last_seen_school_info_interstitial = DateTime.now

    return true
  end
end
