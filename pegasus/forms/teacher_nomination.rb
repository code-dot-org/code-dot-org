class TeacherNomination

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:relationship_s] = required stripped data[:relationship_s]
    result[:teacher_name_s] = required stripped data[:teacher_name_s]
    result[:teacher_email_s] = required email_address data[:teacher_email_s]
    result[:teacher_subject_s] = required data[:teacher_subject_s]
    result[:teacher_link_s] = stripped data[:teacher_link_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_zip_code_s] = required zip_code data[:school_zip_code_s]
    result[:message_s] = required stripped data[:message_s]
    result
  end

  def self.receipt()
    [
      'teacher_nomination_notice',
      'teacher_nomination_notice_2',
      'teacher_nomination_notice_3',
    ]
  end

end
