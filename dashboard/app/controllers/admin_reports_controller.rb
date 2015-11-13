# The controller for reports of internal admin-only data.
class AdminReportsController < ApplicationController
  before_filter :authenticate_user!, except: [:header_stats]

  before_action :set_script
  include LevelSourceHintsHelper

  def admin_concepts
    authorize! :read, :reports
    SeamlessDatabasePool.use_persistent_read_connection do
      render 'admin_concepts', formats: [:html]
    end
  end

  def funometer
    authorize! :read, :reports

    # Compute the global funometer percentage.
    all_ratings = PuzzleRating.all
    @overall_percentage = 100.0 * all_ratings.where(rating: 1).count / all_ratings.count

    # Generate the funometer percentages, by day, for the last month.
    percentages_by_day = all_ratings.where('created_at > ?', Time.now.prev_month).group('DATE(created_at)').order('DATE(created_at)').pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating)')

    # Compute funometer percentages by script.
    @script_headers = ['Script ID', 'Percentage', 'Count']
    @script_ratings = all_ratings.group(:script_id).order('SUM(100.0 * rating) / COUNT(rating)').select('script_id', 'SUM(100.0 * rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

    # Compute funometer percentages by level.
    @level_headers = ['Script ID', 'Level ID', 'Percentage', 'Count']
    level_ratings = all_ratings.select(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating) AS ratio', 'COUNT(rating) AS cnt').group(:script_id, :level_id)
    @favorite_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) desc').limit(25).select(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')
    @hated_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) asc').limit(25).select(:script_id, :level_id, 'SUM(100.0 * rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

    render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
  end

  def funometer_by_script
    authorize! :read, :reports

    @script_id = params[:script_id]
    @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]

    # Generate the funometer percentages for the level, by day.
    ratings = PuzzleRating.where('script_id = ?', @script_id)
    ratings_by_day = ratings.group('DATE(created_at)').order('DATE(created_at)')
    percentages_by_day = ratings_by_day.pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating) AS percentage')
    @overall_percentage = ratings.pluck('SUM(rating) / COUNT(rating) AS percentage')[0]

    render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
  end

  def funometer_by_script_level
    authorize! :read, :reports

    @script_id = params[:script_id]
    @level_id = params[:level_id]

    @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]
    @level_name = Level.where('id = ?', @level_id).pluck(:name)[0]

    # Generate the funometer percentages for the level, by day.
    ratings = PuzzleRating.where('script_id = ?', @script_id).where('level_id = ?', @level_id)
    ratings_by_day = ratings.group('DATE(created_at)').order('DATE(created_at)')
    percentages_by_day = ratings_by_day.pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating) AS percentage')
    @ratings_by_day = ratings_by_day.pluck('DATE(created_at) AS day', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

    render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
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

  def all_usage
    authorize! :read, :reports

    @recent_activities = Activity.all.order('id desc').includes([:user, :level_source, {level: :game}]).limit(50)
    render 'reports/usage', formats: [:html]
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end

end
