require 'cdo/contact_rollups/v2/pardot_helpers'

class Api::V1::AfeController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!

  def submit
    puts CGI.escape(request.body.string)
  end
end
