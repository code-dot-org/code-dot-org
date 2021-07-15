module Types
  class ProjectType < Types::BaseObject
    field :name, String, null: true, hash_key: :name
    field :channel, String, null: true, hash_key: :channel
    field :thumbnail_url, String, null: true, hash_key: :thumbnail_url
    field :type, String, null: true, hash_key: :type
    field :published_at, GraphQL::Types::ISO8601DateTime, null: true, hash_key: :published_at
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true, hash_key: :updated_at
  end
end
