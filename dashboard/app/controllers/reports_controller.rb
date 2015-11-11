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

  def all_usage
    authorize! :read, :reports

    @recent_activities = get_base_usage_activity
    render 'usage', formats: [:html]
  end

  def funometer
    authorize! :read, :reports

    # Compute the global funometer percentage.
    all_ratings = PuzzleRating.all
    positive_ratings = all_ratings.where(rating: 1)
    @global_percentage = 100.0 * positive_ratings.count / all_ratings.count

    # Generate the funometer percentages, by day, for the last month.
    percentages_by_day = all_ratings.select('100.0 * SUM(rating) / COUNT(rating)').where('created_at > ?', Time.now.prev_month).group('DATE(created_at)').order('DATE(created_at)').pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating)')

    # Compute funometer percentages by script.
    @script_headers = ['Script ID', 'Percentage', 'Count']
    @script_ratings = all_ratings.select(:script_id, 'SUM(100.0 * rating) / COUNT(rating) AS ratio', 'COUNT(rating) AS cnt').group(:script_id).order('SUM(100.0 * rating) / COUNT(rating)').pluck(:script_id, 'SUM(100.0 * rating) / COUNT(rating)', 'COUNT(rating)')

    # Compute funometer percentages by level.
    @level_headers = ['Script ID', 'Level ID', 'Percentage', 'Count']
    level_ratings = all_ratings.select(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating) AS ratio', 'COUNT(rating) AS cnt').group(:script_id, :level_id)
    @favorite_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) desc').limit(25).pluck(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating)', 'COUNT(rating)')
    @hated_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) asc').limit(25).pluck(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating)', 'COUNT(rating)')

    render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
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

  def admin_stats
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      @user_count = User.count
      @teacher_count = User.where(:user_type => 'teacher').count
      @student_count = @user_count - @teacher_count
      @users_with_teachers = Follower.distinct.count(:student_user_id)
      @users_with_email = User.where('email <> ""').count
      @users_with_confirmed_email = User.where('confirmed_at IS NOT NULL').count
      @girls = User.where(:gender => 'f').count
      @boys = User.where(:gender => 'm').count

      @prizes_redeemed = Prize.where('user_id IS NOT NULL').group(:prize_provider).count
      @prizes_available = Prize.where('user_id IS NULL').group(:prize_provider).count

      @student_prizes_earned = User.where(:prize_earned => true).count
      @student_prizes_redeemed = Prize.where('user_id IS NOT NULL').count
      @student_prizes_available = Prize.where('user_id IS NULL').count

      @teacher_prizes_earned = User.where(:teacher_prize_earned => true).count
      @teacher_prizes_redeemed = TeacherPrize.where('user_id IS NOT NULL').count
      @teacher_prizes_available = TeacherPrize.where('user_id IS NULL').count

      @teacher_bonus_prizes_earned = User.where(:teacher_bonus_prize_earned => true).count
      @teacher_bonus_prizes_redeemed = TeacherBonusPrize.where('user_id IS NOT NULL').count
      @teacher_bonus_prizes_available = TeacherBonusPrize.where('user_id IS NULL').count
    end
  end

  def admin_progress
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      @user_count = User.count
      @all_script_levels = Script.twenty_hour_script.script_levels.includes({ level: :game })

      @levels_attempted = User.joins(:user_levels).group(:level_id).where('best_result > 0').count
      @levels_attempted.default = 0
      @levels_passed = User.joins(:user_levels).group(:level_id).where('best_result >= 20').count
      @levels_passed.default = 0

      @stage_map = @all_script_levels.group_by { |sl| sl.level.game }
    end
  end

  def admin_concepts
    authorize! :read, :reports
    SeamlessDatabasePool.use_persistent_read_connection do
      render 'admin_concepts', formats: [:html]
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

  def level_completions
    authorize! :read, :reports
    require 'date'
# noinspection RubyResolve
    require Rails.root.join('scripts/archive/ga_client/ga_client')

    @start_date = (params[:start_date] ? DateTime.parse(params[:start_date]) : (DateTime.now - 7)).strftime('%Y-%m-%d')
    @end_date = (params[:end_date] ? DateTime.parse(params[:end_date]) : DateTime.now.prev_day).strftime('%Y-%m-%d')

    @is_sampled = false

    output_data = {}
    %w(Attempt Success).each do |key|
      dimension = 'ga:eventLabel'
      metric = 'ga:totalEvents,ga:uniqueEvents,ga:avgEventValue'
      filter = "ga:eventAction==#{key};ga:eventCategory==Puzzle"
      if params[:filter]
        filter += ";ga:eventLabel=@#{params[:filter].to_s.gsub('_','/')}"
      end
      ga_data = GAClient.query_ga(@start_date, @end_date, dimension, metric, filter)

      @is_sampled ||= ga_data.data.contains_sampled_data

      ga_data.data.rows.each do |r|
        label = r[0]
        output_data[label] ||= {}
        output_data[label]["Total#{key}"] = r[1].to_f
        output_data[label]["Unique#{key}"] = r[2].to_f
        output_data[label]["Avg#{key}"] = r[3].to_f
      end
    end
    output_data.each_key do |key|
      output_data[key]['Avg Success Rate'] = output_data[key].delete('AvgAttempt')
      output_data[key]['Avg attempts per completion'] = output_data[key].delete('AvgSuccess')
      output_data[key]['Avg Unique Success Rate'] = output_data[key]['UniqueSuccess'].to_f / output_data[key]['UniqueAttempt'].to_f
      output_data[key]['Perceived Dropout'] = output_data[key]['UniqueAttempt'].to_f - output_data[key]['UniqueSuccess'].to_f
    end

    page_data = Hash[GAClient.query_ga(@start_date, @end_date, 'ga:pagePath', 'ga:avgTimeOnPage', 'ga:pagePath=~^/s/|^/flappy/|^/hoc/').data.rows]

    data_array = output_data.map do |key, value|
      {'Puzzle' => key}.merge(value).merge('timeOnSite' => page_data[key] && page_data[key].to_i)
    end
    require 'naturally'
    data_array = data_array.select{|x| x['TotalAttempt'].to_i > 10}.sort_by{|i| Naturally.normalize(i.send(:fetch, 'Puzzle'))}
    headers = [
      "Puzzle",
      "Total\nAttempts",
      "Total Successful\nAttempts",
      "Avg. Success\nRate",
      "Avg. #attempts\nper Completion",
      "Unique\nAttempts",
      "Unique Successful\nAttempts",
      "Perceived Dropout",
      "Avg. Unique\nSuccess Rate",
      "Avg. Time\non Page"
    ]
    render locals: {headers: headers, data: data_array}
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

  def pd_progress
    authorize! :read, :reports
    script = Script.find_by!(name: params[:script] || 'K5PD').cached
    require 'cdo/properties'
    locals_options = Properties.get("pd_progress_#{script.id}")
    if locals_options
      render locals: locals_options.symbolize_keys
    else
      render layout: 'application', text: "PD progress data not found for #{script.name}", status: 404
    end
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
