module Types
  class ScriptType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :lessons, [Types::LessonType], null: false

    # field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :wrapup_video_id, Integer, null: true
    # field :user_id, Integer, null: true
    # field :login_required, Boolean, null: false
    # field :properties, String, null: true
    # field :new_name, String, null: true
    # field :family_name, String, null: true
    # field :published_state, String, null: false
  end
end
