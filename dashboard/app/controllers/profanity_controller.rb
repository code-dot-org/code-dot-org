class ProfanityController < ApplicationController
  before_action :authenticate_user!

  # POST /profanity/find
  # @param [String] params[:text] String to test
  # @param [String] params[:locale] Locale to test in. Optional. Uses request locale if not provided.
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    profanity_result = nil
    if params[:text]&.present?
      cache_key = "profanity/#{locale}/#{params[:text]}"
      profanity_result = Rails.cache.fetch(cache_key) {find_potential_profanities}
    end
    render json: profanity_result
  end

  private

  def locale
    params[:locale] || request.locale
  end

  def find_potential_profanities
    ProfanityFilter.find_potential_profanities(params[:text], locale)
  end
end
