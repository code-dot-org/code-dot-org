module SectionCreationCelebrationDialogHelper

  # Determine whether or not to show the section creation celebration dialog
  # This dialog should pop up after a user creates their first section
  # We approximate that here by checking if their oldest section was created within the last minute
  def self.show?(user, force_show: false)
    return true if force_show
    return false unless user
    return false unless user.teacher?

    return true if (Time.now - user.sections.first.created_at) < 1.minute
  end

end
