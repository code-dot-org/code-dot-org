class ProfanityController < ApplicationController
  include ProfanityHelper
  before_action :authenticate_user!

  # POST /profanity/find
  # @param [String] params[:text] String to test
  # @param [String] params[:locale] Locale to test in. Optional. Uses request locale if not provided.
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    render json: find_profanities(params[:text], locale)
  end

  private

  def locale
    params[:locale] || request.locale
  end
end
