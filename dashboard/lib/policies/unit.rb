class Policies::Unit
  # Determines if a curriculum unit can be deleted by checking
  # existing usage and dependencies
  def self.can_be_deleted?(unit)
    return false if unit.get_published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    return false if Section.where(script_id: unit.id).count > 0
    return true
  end
end
