# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    description 'Code.org user'

    def self.authorized?(object, context)
      super #&& Ability.new(context[:current_user]).can?(:read, object)
    end

    field :id, ID, description: 'ID of the user'
    field :name, String, description: 'Name of the user'
    field :email, String, description: 'Email of the user'
    field :status, String, description: 'Status of the user'
  end
end
