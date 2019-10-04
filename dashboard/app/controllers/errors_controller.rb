class ErrorsController < ApplicationController
  def not_found
    render(status: 404)
  end
end
