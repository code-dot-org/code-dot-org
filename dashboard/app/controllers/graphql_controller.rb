# frozen_string_literal: true

class GraphqlController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :execute

  def execute
    render json: GraphqlRails::QueryRunner.call(
      params: params,
      context: graphql_context
    )
  end

  private

  # data defined here will be accessible via `grapqhl_request.context`
  # in GraphqlRails::Controller instances
  def graphql_context
    {}
  end
end
