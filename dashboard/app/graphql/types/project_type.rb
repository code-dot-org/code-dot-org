module Types
  class ProjectType < Types::BaseObject
    field :name, String, null: true, hash_key: :name
    field :channel, String, null: true, hash_key: :channel
    field :thumbnail_url, String, null: true, hash_key: :thumbnailUrl
    field :type, String, null: true, hash_key: :type
    field :published_at, GraphQL::Types::ISO8601DateTime, null: true, hash_key: :publishedAt
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: true, hash_key: :updatedAt
  end
end
