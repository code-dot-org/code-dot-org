module Types
  class UserProgressType < Types::BaseObject
    field :total_lines_of_code, Integer, null: false
    field :levels_passed, Integer, null: false
    field :level_progress, [Types::LevelProgressType], null: false do
      argument :script_id, ID, required: true
      argument :level_id, ID, required: false
    end
  end
end
