# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    description 'Top level query'

    field :section, Types::SectionType, description: 'Fetches a section given an ID' do
      argument :id, ID, required: true, description: 'ID of the section'
    end

    def section(id:)
      Section.find(id)
    end
  end
end
