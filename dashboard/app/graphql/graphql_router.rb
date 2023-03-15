# frozen_string_literal: true

GraphqlRouter = GraphqlRails::Router.draw do
  scope module: :graphql do
    # this will create all CRUD actions for Graphql::UsersController:
    #   resources :users
    #
    # If you want non-CRUD custom actions, you can define them like this:
    #   query :find_something, to: 'controller_name#action_name'
    #   mutation :change_something, to: 'controller_name#action_name'
    # or you can include them in resources part:
    #   resources :users do
    #     query :find_one, on: :member
    #     query :find_many, on: :collection
    #   end

    resources :example_users, only: %i[show update]
  end
end
