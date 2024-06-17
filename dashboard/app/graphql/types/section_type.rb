# frozen_string_literal: true

module Types
  class SectionType < Types::BaseObject
    description 'Section'

    def self.authorized?(section, context)
      super && Ability.new(context[:current_user]).can?(:read, section)
    end

    field :id, ID, description: 'ID of the section'
    field :name, String, description: 'Name of the section'
    field :students, [UserType], description: 'Students in the section'
    field :instructors, [UserType], description: 'Instructors in the section'
  end
end
