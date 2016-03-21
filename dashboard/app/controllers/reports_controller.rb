# TODO: reorganize this so it's more obvious which actions are for
# students, teachers, and admins (most likely move into more relevant
# controllers)

class ReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]
  check_authorization except: [:header_stats]

  before_action :set_script

  def header_stats
    if params[:section_id].present?
      @section = Section.find(params[:section_id])
      authorize! :read, @section
    end

    if params[:user_id].present?
      user = User.find(params[:user_id])
      authorize! :read, user
      render file: 'shared/_user_stats', layout: false, locals: {user: user}
    else
      render file: 'shared/_user_stats', layout: false, locals: {user: current_user, async: true}
    end
  end

  def prizes
    authorize! :read, current_user
  end

  private

  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end
end
