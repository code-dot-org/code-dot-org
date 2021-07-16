module Types
  class LevelProgressType < Types::BaseObject
    field :level_id, ID, null: false
    field :status, String, null: false
    field :is_locked, Boolean, null: false
    field :is_paired, Boolean, null: false
  end
end
