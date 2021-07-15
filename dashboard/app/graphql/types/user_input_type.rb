module Types
  class UserInputType < Types::BaseInputObject
    description "Parameters for creating or updating a user"

    argument :name, String, required: false
    argument :age, Integer, required: false
    argument :gender, String, required: false, description: "m/f/n/o/-"
    argument :sharing_enabled, Boolean, required:false
  end
end
