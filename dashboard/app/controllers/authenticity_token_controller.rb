class AuthenticityTokenController < ApplicationController
  # GET /get_token
  def get_token
    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end
end
