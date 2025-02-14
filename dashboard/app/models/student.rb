class Student < User
  def self.sti_name
    TYPE_STUDENT
  end

  def student?
    true
  end

  def teacher?
    false
  end
end
