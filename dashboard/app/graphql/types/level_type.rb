module Types
  class LevelType < Types::BaseObject
    field :id, ID, null: false
    field :kind, String, null: false
    field :title, String, null: false
    field :is_unplugged, Boolean, null: false
    field :is_bonus, Boolean, null: false
    field :is_concept, Boolean, null: false
  end
end
