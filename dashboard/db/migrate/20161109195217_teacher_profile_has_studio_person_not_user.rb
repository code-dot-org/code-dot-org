class TeacherProfileHasStudioPersonNotUser < ActiveRecord::Migration[5.0]
  def change
    # After further discussion, the decision is that a StudioPerson, rather than
    # a User, should be associated with a TeacherProfile.
    remove_belongs_to :teacher_profiles, :user, index: true
    add_belongs_to :teacher_profiles, :studio_person, index: true, after: :id
  end
end
