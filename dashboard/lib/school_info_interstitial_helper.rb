module SchoolInfoInterstitialHelper
  def self.show_school_info_interstitial?(user)
    return false unless user.teacher?

    return false if user.account_age_days < 7

    school_info = user.school_info

    # Interstitial should pop up the first time for the teacher if it has been at least 30 days since the teacher signed
    # up for an account AND the teacher hasn’t previously filled out all the fields already (e.g. as part
    # of workshop registration).
    return false if school_info && complete?(school_info)

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
  def self.show_school_info_confirmation_dialog?(user)
    return false unless user.teacher?

    return false if user.user_school_infos.empty?

    user_school_info = user.user_school_infos.last

    school_info = user_school_info.school_info

    check_school_type = (school_info.public_school? || school_info.private_school? || school_info.charter_school?) && SchoolInfoInterstitialHelper.complete?(school_info)

    check_last_confirmation_date = user_school_info.last_confirmation_date.to_datetime < 1.year.ago

    check_last_confirmation_date && check_school_type
  end

  # Decides whether the school info is complete enough to stop bugging the
  # teacher for additional information every week.  Different from complete
  # record validation.
  def self.complete?(school_info)
    return true unless school_info.school_id.nil?
    return false if school_info.country.nil?
    return true unless school_info.usa?
    return true if [
      SchoolInfo::SCHOOL_TYPE_HOMESCHOOL,
      SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL,
      SchoolInfo::SCHOOL_TYPE_ORGANIZATION,
      SchoolInfo::SCHOOL_TYPE_OTHER,
    ].include?(school_info.school_type)

    # Given we got past above cases, school name is sufficient
    !!school_info.school_name
  end
end
