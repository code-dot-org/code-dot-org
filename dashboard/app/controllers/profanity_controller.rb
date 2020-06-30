class ProfanityController < ApplicationController
  before_action :authenticate_user!

  # POST /profanity/find
  # @param [String] params[:text] String to test
  # @param [String] params[:language] Language of the text to test
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    render json: ProfanityFilter.find_potential_profanities(params[:text] || "", params[:language] || request.locale)
  end
end
