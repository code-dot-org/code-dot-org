require 'json'

class LangfuseController < ApplicationController
  include LangfuseHelper

  def get_prompts
    response = LangfuseHelper.fetch_prompts(prompt_params[:name])
    return render(status: response[:status], json: response[:json])
  end

  private

  def prompt_params
    params.permit(:name)
  end
end