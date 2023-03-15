# frozen_string_literal: true

module Graphql
  # base class of all GraphqlControllers
  class ExampleUsersController < GraphqlApplicationController
    model('String')

    action(:show).permit(id: :ID!).returns_single
    action(:update).permit(id: :ID!).returns_single

    def show
      'this is example show action. Remove it and write something real'
    end

    def update
      'this is example update action. Remove it and write something real'
    end
  end
end
