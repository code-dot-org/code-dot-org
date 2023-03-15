# frozen_string_literal: true

module Graphql
  # base class of all GraphqlControllers
  class ExampleUsersController < GraphqlApplicationController
    model('User')

    action(:show).permit(id: :ID!).returns_single
    action(:update).permit(id: :ID!).returns_single

    def show
      User.find(params[:id])
    end

    def update
      'this is example update action. Remove it and write something real'
    end
  end
end
