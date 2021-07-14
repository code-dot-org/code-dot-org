module Types
  class SectionType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: true
    field :code, String, null: true
    field :teacher, Types::UserType, null: false
    field :students, [Types::UserType, null:false], null: false

    # field :user_id, Integer, null: false
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :script_id, Integer, null: true
    # field :course_id, Integer, null: true
    # field :grade, String, null: true
    # field :login_type, String, null: false
    # field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :stage_extras, Boolean, null: false
    # field :section_type, String, null: true
    # field :first_activity_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :pairing_allowed, Boolean, null: false
    # field :sharing_disabled, Boolean, null: false
    # field :hidden, Boolean, null: false
    # field :tts_autoplay_enabled, Boolean, null: false
    # field :restrict_section, Boolean, null: true
    # field :name, String, null: true
    # field :students, Types::UserType, null: true
  end
end
