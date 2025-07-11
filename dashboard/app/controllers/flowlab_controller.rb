class FlowlabController < ApplicationController
  def index
    # Ensure that user has levelbuilder permissions.
    authorize! :create, Level

    view_options(no_footer: true)
  end
end
