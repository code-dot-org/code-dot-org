class StudentNomination

  def self.normalize(data)
    result = {}
    result[:email_s] = required email_address data[:email_s]
    result[:name_s] = required stripped data[:name_s]
    result[:relationship_s] = required stripped data[:relationship_s]
    result[:student_name_s] = required stripped data[:student_name_s]
    result[:student_email_s] = nil_if_empty email_address data[:student_email_s]
    result[:student_grade_i] = required data[:student_grade_i]
    result[:student_link_s] = stripped data[:student_link_s]
    result[:school_name_s] = required stripped data[:school_name_s]
    result[:school_zip_code_s] = required zip_code data[:school_zip_code_s]
    result[:message_s] = required stripped data[:message_s]
    result
  end

  def self.receipt()
    [
      'student_nomination_notice',
      'student_nomination_notice_2',
    ]
  end

end
