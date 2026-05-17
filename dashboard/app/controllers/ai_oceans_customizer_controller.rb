class AiOceansCustomizerController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_authorization_check

  def show
  end
end
