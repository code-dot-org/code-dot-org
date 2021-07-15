module Mutations
  class UpdateUser < BaseMutation
    field :errors, [String], null: true
    field :user, Types::UserType, null: true

    argument :id, ID, required: true, as: :user_id
    argument :input, Types::UserInputType, required: true, as: :user_input

    def resolve(user_id:, user_input:)
      # TODO: There's some inconsistency around how errors are reported.
      # Some errors (e.g. bad user_id) will result in a top-level error
      # but others will result in an error object. Not sure if this needs
      # to be fixed or not.

      user = User.find(user_id)

      # TODO: Authorize this action

      user.name = user_input.name unless user_input.name.nil?
      user.age = user_input.age unless user_input.age.nil?
      user.gender = user_input.gender unless user_input.gender.nil?
      user.sharing_disabled = !user_input.sharing_enabled unless user_input.sharing_enabled.nil?

      success = user.save

      return success ?
        { user: user } :
        { errors: user.errors.full_messages }   # TODO: Remove backtrace?
    end
  end
end
