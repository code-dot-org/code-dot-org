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

    SeamlessDatabasePool.use_persistent_read_connection do
      # Compute the global funometer percentage.
      ratings = PuzzleRating.all
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages, by day, for the last month.
      @ratings_by_day_headers = ['Date', 'Percentage', 'Count']
      @ratings_by_day, percentages_by_day = get_ratings_by_day(ratings)

      # Compute funometer percentages by script.
      @script_headers = ['Script ID', 'Script Name', 'Percentage', 'Count']
      @script_ratings = ratings.joins("INNER JOIN scripts ON scripts.id = puzzle_ratings.script_id").group(:script_id).order('SUM(100.0 * rating) / COUNT(rating)').select('script_id', 'name', 'SUM(100.0 * rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

      # Compute funometer percentages by level, saving the most-favored and
      # least-favored with over one hundred ratings.
      @level_headers = ['Script ID', 'Level ID', 'Script Name', 'Level Name', 'Percentage', 'Count']
      level_ratings = ratings.joins("INNER JOIN scripts ON scripts.id = puzzle_ratings.script_id").joins("INNER JOIN levels ON levels.id = puzzle_ratings.level_id").group(:script_id, :level_id).select(:script_id, :level_id, 'scripts.name AS script_name', 'levels.name AS level_name', 'SUM(100.0 * rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt').having('cnt > ?', 100)
      @favorite_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) desc').limit(25)
      @hated_level_ratings = level_ratings.order('SUM(100.0 * rating) / COUNT(rating) asc').limit(25)

      render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
    end
  end

  def funometer_by_script
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]

      # Compute the global funometer percentage for the script.
      ratings = PuzzleRating.where('puzzle_ratings.script_id = ?', @script_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the script, by day, for the last month.
      @ratings_by_day_headers = ['Date', 'Percentage', 'Count']
      @ratings_by_day, percentages_by_day = get_ratings_by_day(ratings)

      # Generate the funometer percentages for the script, by stage.
      ratings_by_stage = ratings.joins("INNER JOIN script_levels ON puzzle_ratings.script_id = script_levels.script_id AND puzzle_ratings.level_id = script_levels.level_id").joins("INNER JOIN stages ON stages.id = script_levels.stage_id").group('script_levels.stage_id').order('script_levels.stage_id')
      @ratings_by_stage_headers = ['Stage ID', 'Stage Name', 'Percentage', 'Count']
      @ratings_by_stage = ratings_by_stage.select('stage_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

      # Generate the funometer percentages for the script, by level.
      ratings_by_level = ratings.joins(:level).group(:level_id).order(:level_id)
      @ratings_by_level_headers = ['Level ID', 'Level Name', 'Percentage', 'Count']
      @ratings_by_level = ratings_by_level.select('level_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

      render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
    end
  end

  def funometer_by_script_level
    authorize! :read, :reports

    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]
      @level_id = params[:level_id]
      @level_name = Level.where('id = ?', @level_id).pluck(:name)[0]

      ratings = PuzzleRating.where('puzzle_ratings.script_id = ?', @script_id).where('level_id = ?', @level_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the level, by day, for the last month.
      @ratings_by_day_headers = ['Date', 'Percentage', 'Count']
      @ratings_by_day, percentages_by_day = get_ratings_by_day(ratings)

      render locals: {percentages_by_day: percentages_by_day.to_a.map{|k,v|[k.to_s,v.to_f]}}
    end
  end

  def level_completions
    authorize! :read, :reports
    require 'date'
# noinspection RubyResolve
    require Rails.root.join('scripts/archive/ga_client/ga_client')

    SeamlessDatabasePool.use_persistent_read_connection do
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

  def hoc_signups
    # Requested by Roxanne on 16 November 2015 to track HOC 2015 signups by day.
    authorize! :read, :reports

    # Get the HOC 2014 and HOC 2015 signup counts by day, deduped by email and name.
    # We restrict by dates to avoid long trails of (inappropriate?) signups.
    data_2014 = DB[:forms].
        where('kind = ? AND created_at > ? AND created_at < ?', 'HocSignup2014', '2014-08-01', '2015-01-01').
        group(:name, :email).
        # TODO(asher): Is this clumsy notation really necessary? Is Sequel
        # really this stupid? Also below.
        group_and_count(Sequel.as(Sequel.qualify(:forms, :created_at).cast(:date),:created_at_day)).
        order(:created_at_day).
        all.
        map{|row| [row[:created_at_day].strftime("%m-%d"), row[:count].to_i]}
    data_2015 = DB[:forms].
        where('kind = ? AND created_at > ? AND created_at < ?', 'HocSignup2015', '2015-08-01', '2016-01-01').
        group(:name, :email).
        group_and_count(Sequel.as(Sequel.qualify(:forms, :created_at).cast(:date),:created_at_day)).
        order(:created_at_day).
        all.
        map{|row| [row[:created_at_day].strftime("%m-%d"), row[:count].to_i]}

    # Construct the hash {MM-DD => [count2014, count2015]}.
    # Start by constructing the key space as the union of the MM-DD dates for
    # data_2014 and data_2015.
    require 'set'
    dates = Set.new []
    data_2014.each do |day|
      dates.add(day[0])
    end
    data_2015.each do |day|
      dates.add(day[0])
    end
    # Then populate the keys of our hash {date=>[count2014,count2015], ..., date=>[...]} with dates.
    data_by_day = {}
    dates.each do |date|
      data_by_day[date] = [0, 0]
    end
    # Finally populate the values of our hash.
    data_2014.each do |day|
      data_by_day[day[0]][0] = day[1]
    end
    data_2015.each do |day|
      data_by_day[day[0]][1] = day[1]
    end

    render locals: {data_by_day: data_by_day.sort}
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end

  private
  def get_ratings_by_day(ratings_to_process)
    ratings_by_day = ratings_to_process.where('created_at > ?', Time.now.prev_month).group('DATE(created_at)').order('DATE(created_at)')
    return ratings_by_day.select('DATE(created_at) AS day', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt'), ratings_by_day.pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating)')
  end

  def get_percentage_positive(ratings_to_process)
    return 100.0 * ratings_to_process.where(rating: 1).count / ratings_to_process.count
  end

end
