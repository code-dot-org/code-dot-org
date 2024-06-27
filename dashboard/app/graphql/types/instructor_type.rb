# frozen_string_literal: true

module Types
  class InstructorType < Types::BaseObject
    description 'Code.org Instructor'

    def self.authorized?(object, context)
      super #&& Ability.new(context[:current_user]).can?(:read, object)
    end

    field :id, ID, description: 'ID of the user'
    field :instructor, UserType, description: 'Instructor'
    field :status, String, description: 'Status of the user'
    field :instructor_email, String, resolver_method: :instructor_email
    field :instructor_name, String, resolver_method: :instructor_name

    def instructor_email
      object.instructor.email
    end

    def instructor_name
      object.instructor.name
    end
  end
end
