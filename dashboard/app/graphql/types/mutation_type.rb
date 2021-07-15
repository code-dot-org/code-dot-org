module Types
  class MutationType < Types::BaseObject
    field :update_user, mutation: Mutations::UpdateUser
  end
end
