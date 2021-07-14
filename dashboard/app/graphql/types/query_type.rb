module Types
  class QueryType < Types::BaseObject
    description "The query root of this schema"

    field :signed_in_user, Types::UserType, null: true do
      description "The currently signed in user. Returns null if the user is not signed in."
    end
    def signed_in_user
      return context[:current_user]
    end

    field :section, Types::SectionType, null: false do
      description "Gets a section by id"
      argument :id, ID, required: true
    end
    def section(id:)
      return Section.find(id)
    end
  end
end
