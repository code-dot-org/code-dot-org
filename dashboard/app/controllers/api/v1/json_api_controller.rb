class Api::V1::JsonApiController < ApplicationController
  layout false

  # Don't bother redirecting to login when denying access to the JSON APIs
  rescue_from CanCan::AccessDenied do
    head :forbidden
  end
end
