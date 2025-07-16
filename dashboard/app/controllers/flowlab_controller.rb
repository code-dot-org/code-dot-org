class FlowlabController < ApplicationController
  def index
    return head :forbidden unless current_user&.levelbuilder?

    view_options(no_footer: true)
  end
end
