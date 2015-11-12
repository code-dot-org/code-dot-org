# TODO: reorganize this so it's more obvious which actions are for
# students, teachers, and admins (most likely move into more relevant
# controllers)

class ReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]

  check_authorization except: [:header_stats, :students]

  before_action :set_script
  include LevelSourceHintsHelper

  def user_stats
    @user = User.find(params[:user_id])
    authorize! :read, @user

    #@recent_activity = Activity.where(['user_id = ?', user.id]).order('id desc').includes({level: :game}).limit(2)
    @recent_levels = UserLevel.find_by_sql(<<SQL)
select ul.*, sl.position, l.game_id, sl.chapter, sl.script_id, sl.id as script_level_id
from user_levels ul
inner join script_levels sl on sl.level_id = ul.level_id
inner join levels l on l.id = ul.level_id
where sl.script_id = 1 and ul.user_id = #{@user.id}
order by ul.updated_at desc limit 2
SQL
  end

  def header_stats
    if params[:section_id].present?
      @section = Section.find(params[:section_id])
      authorize! :read, @section
    end

    if params[:user_id].present?
      user = User.find(params[:user_id])
      authorize! :read, user
    end
    render file: 'shared/_user_stats', layout: false, locals: {user: user || current_user}
  end

  def prizes
    authorize! :read, current_user
  end

  def usage
    @user = User.find(params[:user_id])
    authorize! :read, @user

    @recent_activities = get_base_usage_activity.where(['user_id = ?', @user.id])
  end

  def csp_pd_responses
    authorize! :read, :reports

    @headers = ['Level ID', 'User Email', 'Data']
    @response_limit = 100
    @responses = {}
    [3911, 3909, 3910, 3907].each do |level_id|
      # Regardless of the level type, query the DB for teacher repsonses.
      @responses[level_id] = LevelSource.limit(@response_limit).where(level_id: level_id).joins(:activities).joins("INNER JOIN users ON activities.user_id = users.id").pluck(:level_id, :email, :data)

      # If the level type is multiple choice, get the text answers and replace
      # the numerical responses stored with the corresponding text.
      if [3911, 3909, 3910].include? level_id
        level_properties = Level.where(id: level_id).pluck(:properties)
        if level_properties.length > 0
          level_answers = level_properties[0]["answers"]
          @responses[level_id].each do |response|
            response[2] = level_answers[response[2].to_i]["text"]
          end
        end
      end
    end
  end

  def students
    redirect_to teacher_dashboard_url
  end

  def level_stats
    authorize! :read, :reports

    @level = Level.find(params[:level_id])

    best_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    passing_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    finished_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    unsuccessful_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }
    all_but_best_code_map = Hash.new{|h,k| h[k] = {:level_source_id => k, :count => 0, :popular => false} }

    Activity.all.where(['level_id = ?', @level.id]).order('id desc').limit(10000).each do |activity|
      # Do not process activity records with nil level_source_id
      if activity.level_source_id.nil?
        next
      end
      if activity.best?
        best_code_map[activity.level_source_id][:count] += 1
      elsif activity.passing?
        passing_code_map[activity.level_source_id][:count] += 1
      elsif activity.finished?
        finished_code_map[activity.level_source_id][:count] += 1
      else
        unsuccessful_code_map[activity.level_source_id][:count] += 1
      end

      unless activity.best?
        all_but_best_code_map[activity.level_source_id][:count] += 1
      end
    end

    # Setting up the popular incorrect code
    unless all_but_best_code_map.empty?
      sorted_all_but_best_code = all_but_best_code_map.values.sort_by {|v| -v[:count] }
      pop_level_source_ids = Array.new([sorted_all_but_best_code.length - 1, 9].min)
      (0..[sorted_all_but_best_code.length - 1, 9].min).each do |idx|
        pop_level_source_id = sorted_all_but_best_code[idx][:level_source_id]
        pop_level_source_ids[idx] = pop_level_source_id
        if passing_code_map.has_key?(pop_level_source_id)
          passing_code_map[pop_level_source_id][:popular] = true
          passing_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        elsif finished_code_map.has_key?(pop_level_source_id)
          finished_code_map[pop_level_source_id][:popular] = true
          finished_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        elsif unsuccessful_code_map.has_key?(pop_level_source_id)
          unsuccessful_code_map[pop_level_source_id][:popular] = true
          unsuccessful_code_map[pop_level_source_id][:pop_level_source_idx] = idx
        end
      end
    end

    @best_code = best_code_map.values.sort_by {|v| -v[:count] }
    @passing_code = passing_code_map.values.sort_by {|v| -v[:count] }
    @finished_code = finished_code_map.values.sort_by {|v| -v[:count] }
    @unsuccessful_code = unsuccessful_code_map.values.sort_by {|v| -v[:count] }
    @pop_level_source_ids = pop_level_source_ids

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

  private
  def get_base_usage_activity
    Activity.all.order('id desc').includes([:user, :level_source, {level: :game}]).limit(50)
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end
end
