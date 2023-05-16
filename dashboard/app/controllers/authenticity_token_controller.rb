class AuthenticityTokenController < ApplicationController
  # GET /get_token
  def get_token
    return head :forbidden unless Gatekeeper.allows('csrf-token-endpoint', default: true)
    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end
end
