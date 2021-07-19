module Mutations
  class CreateNewUserInSection < BaseMutation
    field :errors, [String], null: true
    field :user, Types::UserType, null: true

    argument :section_id, ID, required: true
    argument :input, Types::UserInputType, required: true, as: :user_input

    def resolve(section_id:, user_input:)
      # TODO: Authorize this action

      section = Section.find(section_id)

      # TODO: How to share code here with update user?
      user = User.new()
      user.user_type = User::TYPE_STUDENT
      user.provider = User::PROVIDER_SPONSORED
      user.name = user_input.name unless user_input.name.nil?
      user.age = user_input.age unless user_input.age.nil?
      user.gender = user_input.gender unless user_input.gender.nil?
      user.sharing_disabled = !user_input.sharing_enabled unless user_input.sharing_enabled.nil?

      success = user.save
      return { errors: user.errors.full_messages } unless success

      section.add_student(user, current_user)
      return { user: user }
    end
  end
end
