# TODO: reorganize this so it's more obvious which actions are for
# students, teachers, and admins (most likely move into more relevant
# controllers)

class ReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]

  check_authorization except: [:header_stats, :students]

  before_action :set_script
  include LevelSourceHintsHelper

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

  def assume_identity_form
    authorize! :manage, :all
  end

  def assume_identity
    authorize! :manage, :all

    user = User.where(:id => params[:user_id]).first
    user ||= User.where(:username => params[:user_id]).first
    user ||= User.find_by_email_or_hashed_email params[:user_id]

    if user
      sign_in user, :bypass => true
      redirect_to '/'
    else
      flash[:alert] = 'User not found'
      render :assume_identity_form
    end
  end

  def monthly_metrics
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      recent_users = User.where(current_sign_in_at: (Time.now - 30.days)..Time.now)
      metrics = {
        :'Teachers with Active Students' => recent_users.joins(:teachers).distinct.count('teachers_users.id'),
        :'Active Students' => recent_users.count,
        :'Active Female Students' => (f = recent_users.where(gender: 'f').count),
        :'Active Male Students' =>  (m = recent_users.where(gender: 'm').count),
        :'Female Ratio' => f.to_f / (f + m),
      }
      render locals: {headers: metrics.keys, metrics: metrics.to_a.map{|k,v|[v]}}
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end
end
