require 'cdo/env'

# The controller for reports of internal admin-only data.
class AdminReportsController < ApplicationController
  before_filter :authenticate_user!
  before_action :require_admin
  check_authorization

  before_action :set_script
  include LevelSourceHintsHelper

  def funometer
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      @stats = Properties.get(:funometer)
      @ratings_by_day = @stats['ratings_by_day'] if @stats.present?
    end
  end

  def funometer_by_script
    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]

      # Compute the global funometer percentage for the script.
      ratings = PuzzleRating.where('puzzle_ratings.script_id = ?', @script_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the script, by day.
      @ratings_by_day = get_ratings_by_day(ratings)

      # Generate the funometer percentages for the script, by stage.
      ratings_by_stage = ratings.
                         joins("INNER JOIN script_levels ON puzzle_ratings.script_id = script_levels.script_id AND puzzle_ratings.level_id = script_levels.level_id").
                         joins("INNER JOIN stages ON stages.id = script_levels.stage_id").
                         group('script_levels.stage_id').
                         order('script_levels.stage_id')
      @ratings_by_stage_headers = ['Stage ID', 'Stage Name', 'Percentage', 'Count']
      @ratings_by_stage = ratings_by_stage.
                          select('stage_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')

      # Generate the funometer percentages for the script, by level.
      ratings_by_level = ratings.joins(:level).group(:level_id).order(:level_id)
      @ratings_by_level_headers = ['Level ID', 'Level Name', 'Percentage', 'Count']
      @ratings_by_level = ratings_by_level.
                          select('level_id', 'name', '100.0 * SUM(rating) / COUNT(rating) AS percentage', 'COUNT(rating) AS cnt')
    end
  end

  def funometer_by_script_level
    SeamlessDatabasePool.use_persistent_read_connection do
      @script_id = params[:script_id]
      @script_name = Script.where('id = ?', @script_id).pluck(:name)[0]
      @level_id = params[:level_id]
      @level_name = Level.where('id = ?', @level_id).pluck(:name)[0]

      ratings = PuzzleRating.
                where('puzzle_ratings.script_id = ?', @script_id).
                where('level_id = ?', @level_id)
      @overall_percentage = get_percentage_positive(ratings)

      # Generate the funometer percentages for the level, by day.
      @ratings_by_day = get_ratings_by_day(ratings)
    end
  end

  def level_answers
    SeamlessDatabasePool.use_persistent_read_connection do
      @headers = ['Level ID', 'User Email', 'Data']
      @responses = {}
      @response_limit = 100
      if params[:levels]
        # Parse the parameters, namely the set of levels to grab answers for.
        @levels = params[:levels] ? params[:levels].split(',') : []

        @levels.each do |level_id|
          # Don't query for data if we've already retrieved it.
          if @responses[level_id]
            next
          end

          # Regardless of the level type, query the DB for level answers.
          @responses[level_id] = LevelSource.
                                 where(level_id: level_id).
                                 joins(:activities).
                                 joins("INNER JOIN users ON activities.user_id = users.id").
                                 limit(@response_limit).
                                 pluck(:level_id, :email, :data)

          # Determine whether the level is a multi question, replacing the
          # numerical answer with its corresponding text if so.
          level_info = Level.where(id: level_id).pluck(:type, :properties).first
          if level_info && level_info[0] == 'Multi' && !level_info[1].empty?
            level_answers = level_info[1]["answers"]
            @responses[level_id].each do |response|
              response[2] = level_answers[response[2].to_i]["text"]
            end
          end
        end
      end

      respond_to do |format|
        format.html
        format.csv { return level_answers_csv }
      end
    end
  end

  def level_completions
    require 'date'
# noinspection RubyResolve
    require Rails.root.join('scripts/archive/ga_client/ga_client')

    @is_sampled = false
    # If the window dates are not explicitly specified, we render the page without data so as to
    # not make the user wait on a lengthy GA query whose data will be discarded.
    if params[:start_date].blank? || params[:end_date].blank?
      @start_date = (DateTime.now - 7).strftime('%Y-%m-%d')
      @end_date = DateTime.now.prev_day.strftime('%Y-%m-%d')

      (render locals: {headers: [], data: []}) && return
    end

    @start_date = DateTime.parse(params[:start_date]).strftime('%Y-%m-%d')
    @end_date = DateTime.parse(params[:end_date]).strftime('%Y-%m-%d')

    output_data = {}
    %w(Attempt Success).each do |key|
      dimension = 'ga:eventLabel'
      metric = 'ga:totalEvents,ga:uniqueEvents,ga:avgEventValue'
      filter = "ga:eventAction==#{key};ga:eventCategory==Puzzle"
      if params[:filter].present?
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
    SeamlessDatabasePool.use_persistent_read_connection do
      script = Script.find_by!(name: params[:script] || 'K5PD').cached
      require 'cdo/properties'
      locals_options = Properties.get("pd_progress_#{script.id}")
      if locals_options
        render locals: locals_options.symbolize_keys
      else
        render layout: 'application', text: "PD progress data not found for #{script.name}", status: 404
      end
    end
  end

  def admin_progress
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      stats = Properties.get(:admin_progress)
      if stats.present?
        @user_count = stats['user_count']
        @levels_attempted = stats['levels_attempted']
        @levels_attempted.default = 0
        @levels_passed = stats['levels_passed']
        @levels_passed.default = 0

        @all_script_levels = Script.twenty_hour_script.script_levels.includes({level: :game})
        @stage_map = @all_script_levels.group_by {|sl| sl.level.game}
      end
    end
  end

  def admin_stats
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      @stats = Properties.get('admin_stats')
    end
  end

  def all_usage
    SeamlessDatabasePool.use_persistent_read_connection do
      @recent_activities = Activity.all.order('id desc').includes([:user, :level_source, {level: :game}]).limit(50)
      render 'usage', formats: [:html]
    end
  end

  def hoc_signups
    SeamlessDatabasePool.use_persistent_read_connection do
      # Requested by Roxanne on 16 November 2015 to track HOC 2015 signups by day.
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
  end

  def retention
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      # If no scripts are specified, default to the CSF scripts.
      if !params[:script_ids].present?
        params[:script_ids] = '1, 17, 18, 19, 23'
      end
      @scripts = params[:script_ids].split(',').map(&:to_i)

      # Get the cached retention_stats from the DB, trimming those stats to only the requested
      # scripts, exiting early if the stats are blank.
      raw_retention_stats = Properties.get(:retention_stats)
      if raw_retention_stats.blank?
        render(layout: false, text: 'Properties.get(:retention_stats) not found. Please contact '\
          'an engineer.') && return
      end
      @retention_stats = {}
      raw_retention_stats.each_pair do |key, key_data|
        @retention_stats[key] = key_data.select{|script_id, _script_data| @scripts.include? script_id.to_i}
      end
      if @retention_stats['script_starts'].empty?
        render(layout: false, text: 'No data could be found for the specified scripts. Please '\
          'check the IDs, contacting an engineer as necessary.') && return
      end
      # Remove the stage_level_counts data, which are not used in this view.
      @retention_stats.delete('stage_level_counts')
      # Transform the count stats into row format to facilitate being added to charts and tables.
      ['script_level_counts', 'script_stage_counts'].each do |key|
        @retention_stats[key] = build_row_arrays(@retention_stats[key])
      end
    end
  end

  def retention_stages
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      # If no stages are specified, default to popular HOC stages.
      if !params[:stage_ids].present?
        params[:stage_ids] = '2, 6, 25, 105, 107, 108'
      end
      @stages = params[:stage_ids].split(',').map(&:to_i)

      # Grab the data from the database, keeping data only for the requested stages.
      raw_retention_stats = Properties.get(:retention_stats)
      if raw_retention_stats.blank? || !raw_retention_stats.key?('stage_level_counts')
        render(text: "Properties.get(:retention_stats) or "\
          "Properties.get(:retention_stats)['stage_level_counts'] not found. Please contact an "\
          "engineer.") && return
      end
      raw_retention_stats = raw_retention_stats['stage_level_counts'].
        select{|stage_id, _stage_data| @stages.include? stage_id.to_i}
      if raw_retention_stats.blank?
        render(text: 'No data could be found for the specified stages. Please check the IDs, '\
          'contacting an engineer as necessary.') && return
      end
      @retention_stats = build_row_arrays(raw_retention_stats)
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end

  private
  def get_ratings_by_day(ratings_to_process)
    return ratings_to_process.
           group('DATE(created_at)').
           order('DATE(created_at)').
           pluck('DATE(created_at)', '100.0 * SUM(rating) / COUNT(rating)', 'COUNT(rating)')
  end

  def get_percentage_positive(ratings_to_process)
    return 100.0 * ratings_to_process.where(rating: 1).count / ratings_to_process.count
  end

  # Manipulates the count_stats hash of arrays to an array of arrays, each inner array representing
  # a slice across the hash arrays.
  # Returns nil if the hash is blank.
  def build_row_arrays(count_stats)
    # Determine the number of final number of rows, being the maximum array size in the hash.
    array_length = count_stats.max_by{|_k,v| v.size}[1].size

    # Initialize and construct the row_arrays.
    row_arrays = Array.new(array_length) {Array.new(count_stats.size + 1, 0)}
    row_arrays.each_with_index do |subarray, index|
      subarray[0] = index
    end
    count_stats.values.each_with_index do |counts, index|
      counts.each_with_index do |count, subindex|
        row_arrays[subindex][index + 1] = count
      end
    end

    return row_arrays
  end

  def level_answers_csv
    send_data(
      CSV.generate do |csv|
        csv << @headers
        @responses.each_value do |level_responses|
          level_responses.each do |response|
            csv << response
          end
        end
        csv
      end,
      :type => 'text/csv')
  end
end
