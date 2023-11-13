# Custom CSV serializer for the grades array.
# Used in app/models/sections/section.rb.
class GradesArray
  def self.dump(grades)
    unless grades.is_a?(Array) || grades.nil?
      raise ArgumentError, "Grades must be an array"
    end
    # Sort the grades before writing to the DB, so they end up in the
    # format our data team expects them to be.
    grades ? grades.uniq.sort_by do |grade|
      SharedConstants::STUDENT_GRADE_LEVELS.index(grade) ||
        Float::INFINITY
    end.join(',') : nil
  end

  def self.load(grades)
    grades&.split(',')&.uniq
  end
end
