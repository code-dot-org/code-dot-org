module Mutations
  class RemoveUserFromSection < BaseMutation
    # TODO: Can we have a mutation with no fields?
    field :errors, [String], null: true

    argument :user_id, ID, required: true
    argument :section_id, ID, required: true

    def resolve(user_id:, section_id:)
      # TODO: Authorize this action

      user = User.find(user_id)
      section = Section.find(section_id)
      follower = Follower.where(section: section.id, student_user_id: user.id).first

      section.remove_student(user, follower,  {})

      return { errors: [] }
    end
  end
end
