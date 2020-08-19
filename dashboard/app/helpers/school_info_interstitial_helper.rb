module SchoolInfoInterstitialHelper
  def self.show?(user)
    return false if user.nil?
    return false unless user.teacher?

    return false if user.account_age_days < 7

    # Interstitial should pop up the first time for the teacher if it has been at least 7 days since the teacher signed
    # up for an account AND the teacher hasn’t previously filled out all the fields already (e.g. as part
    # of workshop registration).
    return false if Queries::SchoolInfo.last_complete(user)

    if user.last_seen_school_info_interstitial
      days_since_interstitial_seen = (DateTime.now - user.last_seen_school_info_interstitial.to_datetime).to_i
      return false if days_since_interstitial_seen < 7
    end

    # We skip validation as some of our users (particularly teachers) do not pass our own
    # validations (often because they are missing an email).
    user.last_seen_school_info_interstitial = DateTime.now
    user.save(validate: false)

    return true
  end

  # Show the school info confirmation dialog when a teacher has either completely
  # filled out the school info interstitial for a US public, private, or charter school
  # or confirmed current school over a year ago.
  def self.show_confirmation_dialog?(user)
    return false if user.nil?
    return false unless user.teacher?

    return false if user.user_school_infos.empty?

    user_school_info = Queries::UserSchoolInfo.last_complete(user)
    school_info = user_school_info&.school_info
    return false unless school_info

    check_school_type = (school_info.public_school? || school_info.private_school? || school_info.charter_school?) &&
      school_info.complete? && school_info.usa?

    check_last_confirmation_date = user_school_info.last_confirmation_date.to_datetime < 1.year.ago

    check_last_seen_school_info_interstitial = user.last_seen_school_info_interstitial&.to_datetime.nil? ||
      user.last_seen_school_info_interstitial.to_datetime < 7.days.ago

    show_dialog = check_last_seen_school_info_interstitial && check_last_confirmation_date && check_school_type

    if show_dialog
      # Check to ensure last seen school info interstitial is saved.
      user.last_seen_school_info_interstitial = DateTime.now
      user.save(validate: false)
    end

    show_dialog
  end
end
