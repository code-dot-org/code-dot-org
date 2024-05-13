class Teacher < User
  def self.sti_name
    TYPE_TEACHER
  end

  def student?
    false
  end

  def teacher?
    true
  end
end
