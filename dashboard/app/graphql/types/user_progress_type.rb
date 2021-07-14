module Types
  class UserProgressType < Types::BaseObject
    field :total_lines_of_code, Integer, null: true
    field :levels_passed, Integer, null: true
  end
end
