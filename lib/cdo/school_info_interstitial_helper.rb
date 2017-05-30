module SchoolInfoInterstitialHelper
  def self.show_school_info_interstitial?(user)
    return false unless user.teacher?

    return false if user.account_age_days < 30

    school_info = user.school_info

    # Interstitial should pop up the first time for the teacher if it has been at least 30 days since the teacher signed
    # up for an account AND the teacher hasn’t previously filled out all the fields already (e.g. as part
    # of workshop registration).
    return false if school_info && school_info.complete?

    if user.last_seen_school_info_interstitial
      days_since_interstitial_seen = (DateTime.now - user.last_seen_school_info_interstitial.to_datetime).to_i
      return false if days_since_interstitial_seen < 30
    end

    # We also do not want to show the interstitial if there is a school info suggestion
    return false if user.school_info_suggestion?

    # We skip validation as some of our users (particularly teachers) do not pass our own
    # validations (often because they are missing an email).
    user.last_seen_school_info_interstitial = DateTime.now
    user.save(validate: false)

    return true
  end
end
