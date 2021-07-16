module Types
  class LessonType < Types::BaseObject
    field :id, ID, null: false
    field :position, Integer, null: false, method: :absolute_position
    field :name, String, null: false, method: :localized_name
    field :title, String, null: false, method: :localized_title

    field :levels, [Types::LevelType], null: false
    def levels
      object.cached_script_levels.map {|sl| Models::Level.new(sl)}
    end
  end
end
