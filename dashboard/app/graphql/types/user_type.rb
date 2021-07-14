module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :age, Integer, null: true
    field :username, String, null: false
    field :email, String, null: true
    field :name, String, null: false
    field :gender, String, null: false
    field :user_type, String, null: false
    field :secret_words, String, null: true
    field :total_lines, Integer, null: false

    field :secret_picture_path, String, null: true
    def secret_picture_path
      object.secret_picture&.path
    end

    field :has_ever_signed_in, Boolean, null: false
    def has_ever_signed_in
      !object.last_sign_in_at.nil?
    end

    field :progress, Types::UserProgressType, null: false
    def progress
      Models::UserProgress.new(object)
    end

    # field :studio_person_id, Integer, null: true
    # field :parent_email, String, null: true
    # field :encrypted_password, String, null: true
    # field :reset_password_token, String, null: true
    # field :reset_password_sent_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :remember_created_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :sign_in_count, Integer, null: true
    # field :current_sign_in_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :last_sign_in_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :current_sign_in_ip, String, null: true
    # field :last_sign_in_ip, String, null: true
    # field :created_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :updated_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :provider, String, null: true
    # field :uid, String, null: true
    # field :admin, Boolean, null: true
    # field :locale, String, null: false
    # field :birthday, GraphQL::Types::ISO8601Date, null: true
    # field :school, String, null: true
    # field :full_address, String, null: true
    # field :school_info_id, Integer, null: true
    # field :secret_picture_id, Integer, null: true
    # field :active, Boolean, null: false
    # field :hashed_email, String, null: true
    # field :deleted_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :purged_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :properties, String, null: true
    # field :invitation_token, String, null: true
    # field :invitation_created_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :invitation_sent_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :invitation_accepted_at, GraphQL::Types::ISO8601DateTime, null: true
    # field :invitation_limit, Integer, null: true
    # field :invited_by_id, Integer, null: true
    # field :invited_by_type, String, null: true
    # field :invitations_count, Integer, null: true
    # field :terms_of_service_version, Integer, null: true
    # field :urm, Boolean, null: true
    # field :races, String, null: true
    # field :primary_contact_info_id, Integer, null: true
    # field :name, String, null: true
    #
    # field :section, Types::SectionType, null: true
  end
end
