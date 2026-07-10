CERTIFICATE_COURSE_TYPES = {
  HOC: 'hoc',
  PL: 'pl',
  ACCELERATED: 'accelerated',
  OTHER: 'other',
}

# Certificate metadata: course classification and template selection. Kept
# free of an rmagick require so callers (course_info API, the client) can use
# it without loading the render stack; CertificateImage delegates here.
module CertificateMetadata
  def self.course_type(course_name)
    unit_or_unit_group = CurriculumHelper.find_matching_unit_or_unit_group(course_name)
    course_version = unit_or_unit_group&.get_course_version
    return CERTIFICATE_COURSE_TYPES[:PL] if course_version&.pl_course?
    return CERTIFICATE_COURSE_TYPES[:HOC] if course_version&.hoc_or_hoai?
    return CERTIFICATE_COURSE_TYPES[:OTHER] if course_version
    CERTIFICATE_COURSE_TYPES[:HOC]
  end

  # assume any unrecognized course name is a hoc course
  def self.hoc_course?(course_name)
    course_type(course_name) == CERTIFICATE_COURSE_TYPES[:HOC]
  end

  def self.prefilled_title_course?(course)
    return false if %w(blank_certificate.png self_paced_pl_certificate.png).include?(certificate_template_for(course))
    true
  end

  def self.certificate_template_for(course)
    course_type = course_type(course)
    if ScriptConstants.unit_in_category?(:minecraft, course)
      case course
      when ScriptConstants::MINECRAFT_HERO_NAME
        'MC_Hour_Of_Code_Certificate_Hero.png'
      when ScriptConstants::MINECRAFT_AQUATIC_NAME
        'MC_Hour_Of_Code_Certificate_Aquatic.png'
      when ScriptConstants::MINECRAFT_AI_NAME
        'MC_Hour_Of_Code_Certificate_Generation_Ai.png'
      when ScriptConstants::MINECRAFT_SHOW_NAME
        'MC_Hour_Of_Code_Certificate_Show.png'
      when ScriptConstants::MINECRAFT_NIGHT_NAME
        'MC_Hour_Of_AI_Certificate_First_Night.png'
      else
        'MC_Hour_Of_Code_Certificate.png'
      end
    elsif course == 'mee'
      'MC_Hour_Of_Code_Certificate_mee.png'
    elsif course == 'mee_empathy'
      'MC_Hour_Of_Code_Certificate_mee_empathy.png'
    elsif course == 'mee_timecraft'
      'MC_Hour_Of_Code_Certificate_mee_timecraft.png'
    elsif course == 'mee_estate'
      'MC_Hour_Of_Code_Certificate_mee_estate.png'
    elsif course == ScriptConstants::MIX_MOVE_AI_2025
      'mix_move_hour_of_ai_certificate.png'
    elsif course == ScriptConstants::MUSIC_JAM_2024
      'music_hoc_certificate.png'
    elsif [ScriptConstants::OCEANS_NAME, 'ui-test-oceans'].include?(course)
      'oceans_hoc_certificate.png'
    elsif course_type == 'hoc'
      'hour_of_ai_certificate.png'
    elsif course_type == 'pl'
      'self_paced_pl_certificate.png'
    else
      'blank_certificate.png'
    end
  end
end
