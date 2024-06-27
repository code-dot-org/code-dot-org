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
    field :section_instructors, [InstructorType], description: 'Instructors in the section'
    field :grade, [String], description: 'What grades are in the class'
    field :participant_type, String, description: 'What type of participant are in the class'
    field :teacher, UserType, description: 'What type of participant are in the class'
  end
end
