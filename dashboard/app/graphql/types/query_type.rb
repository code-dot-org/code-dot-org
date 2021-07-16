module Types
  class QueryType < Types::BaseObject
    description "The query root of this schema"

    field :signed_in_user, Types::UserType, null: true do
      description "The currently signed in user. Returns null if the user is not signed in."
    end
    def signed_in_user
      return context[:current_user]
    end

    field :user, Types::UserType, null: false do
      description "Gets a user by id"
      argument :id, ID, required: true
    end
    def user(id:)
      return User.find(id)
    end

    field :section, Types::SectionType, null: false do
      description "Gets a section by id"
      argument :id, ID, required: true
    end
    def section(id:)
      return Section.find(id)
    end

    field :script, Types::ScriptType, null: false do
      argument :id, ID, required: true
    end
    def script(id:)
      return Script.get_from_cache(id)
    end

    field :level, Types::LevelType, null: false do
      description "Gets a level by (scriptId, levelId)"
      argument :script_id, ID, required: true
      argument :level_id, ID, required: true
    end
    def level(script_id:, level_id:)
      script = Script.get_from_cache(script_id)
      raise GraphQL::ExecutionError, "Cannot find script" if script.nil?

      script_level = script.script_levels.find { |sl| sl.level_ids.include?(level_id.to_i) }
      raise GraphQL::ExecutionError, "Cannot find level" if script_level.nil?

      return Models::Level.new(script_level)
    end
  end
end
