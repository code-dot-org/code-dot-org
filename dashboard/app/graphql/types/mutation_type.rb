module Types
  class MutationType < Types::BaseObject
    field :update_user, mutation: Mutations::UpdateUser
    field :create_new_user_in_section, mutation: Mutations::CreateNewUserInSection
    field :remove_user_from_section, mutation: Mutations::RemoveUserFromSection
  end
end
