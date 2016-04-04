require 'cdo/env'

# The controller for reports of internal admin-only data.
class AdminReportsController < ApplicationController
  before_filter :authenticate_user!
  before_action :require_admin
  check_authorization

  before_action :set_script
  include LevelSourceHintsHelper

  def directory
  end

  # Parses and presents the data in the SurveyResult dashboard table.
  def diversity_survey
    SeamlessDatabasePool.use_persistent_read_connection do
      # The number of users that submitted the survey.
      @respondents = 0
      # The number of users that submitted or dismissed the survey.
      @participants = 0
      # The number of users choosing the i^th answer for the second question.
      @foodstamps = Array.new(10, 0)
      # The number of FARM students and total students based on FARM answer and class sizes.
      @foodstamps_count = 0
      @foodstamps_all = 0
      # The number of users of each ethnicity.
      @ethnicities = {
        survey2016_ethnicity_american_indian: 0,
        survey2016_ethnicity_asian: 0,
        survey2016_ethnicity_black: 0,
        survey2016_ethnicity_hispanic: 0,
        survey2016_ethnicity_native: 0,
        survey2016_ethnicity_white: 0,
        survey2016_ethnicity_other: 0,
      }
      # The number of students with ethnicities and total reported.
      @ethnic_count = 0
      @ethnic_all = 0
      # The number of students in sections associated to respondent teachers. Note that this may
      # differ from @foodstamps_all and @ethnic_all as a teacher may not answer those questions.
      @student_count = 0

      SurveyResult.all.each do |survey_result|
        @participants += 1
        next if survey_result.properties.blank?
        @respondents += 1

        # The number of born students associated with the teacher.
        teachers_student_count = Follower.
          where(user_id: survey_result.user_id).
          joins('INNER JOIN users ON users.id = followers.student_user_id').
          where('users.last_sign_in_at IS NOT NULL').
          distinct.
          count(:student_user_id)
        @student_count += teachers_student_count

        foodstamp_answer = survey_result.properties['survey2016_foodstamps']
        if foodstamp_answer
          @foodstamps[foodstamp_answer.to_i] += 1
          # Note that this assumes XX% for the range XX% to YY%, so should undercount slightly.
          if foodstamp_answer.to_i <= 7
            @foodstamps_count += foodstamp_answer.to_f / 10 * teachers_student_count
            @foodstamps_all += teachers_student_count
          end
        end

        has_ethnic_data = false
        @ethnicities.each_key do |ethnicity|
          ethnicity_answer = survey_result.properties[ethnicity.to_s].to_i
          if ethnicity_answer > 0
            has_ethnic_data = true
            @ethnicities[ethnicity] += ethnicity_answer
          end
        end
        if has_ethnic_data
          @ethnic_all += teachers_student_count
        end
      end

      @ethnicities.each_value do |count|
        @ethnic_count += count
      end
      @foodstamps_count = @foodstamps_count.to_i
      respond_to do |format|
        format.html
        format.csv { return diversity_survey_csv }
      end
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

  def retention
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      @all_scripts_names_ids = Script.order(:id).pluck(:name, :id).to_h
      selected_scripts_names = params[:selected_scripts_names] ||
        ["20-hour", "course1", "course2", "course3", "course4"]
      @selected_scripts_names_ids = @all_scripts_names_ids.select{|name, _id| selected_scripts_names.include? name}

      # Get the cached retention_stats from the DB, trimming those stats to only the selected
      # scripts, exiting early if the stats are blank.
      raw_retention_stats = Properties.get(:retention_stats)
      if raw_retention_stats.blank?
        render(text: 'Properties.get(:retention_stats) not found. Please contact an engineer.') &&
          return
      end
      # Remove the stage_level_counts data, which is not used in this view.
      raw_retention_stats.delete('stage_level_counts')

      @retention_stats = {}
      raw_retention_stats.each_pair do |key, key_data|
        @retention_stats[key] = key_data.select do |script_id, _script_data|
          @selected_scripts_names_ids.values.include? script_id.to_i
        end
      end
      # Transform the count stats into row format to facilitate being added to charts and tables.
      %w(script_level_counts script_stage_counts).each do |key|
        @retention_stats[key] = build_row_arrays(@retention_stats[key])
      end
    end
  end

  def retention_stages
    require 'cdo/properties'
    SeamlessDatabasePool.use_persistent_read_connection do
      @stage_ids = params[:stage_ids].present? ?
        params[:stage_ids].split(',').map(&:to_i) :
        [2, 6, 25, 105, 107, 108]  # Default to popular HOC stages.
      # Grab the data from the database, keeping data only for the requested stages.
      raw_retention_stats = Properties.get(:retention_stats)
      if raw_retention_stats.blank? || !raw_retention_stats.key?('stage_level_counts')
        render(text: 'Properties.get(:retention_stats) or '\
          "Properties.get(:retention_stats)['stage_level_counts'] not found. Please contact an "\
          'engineer.') && return
      end
      raw_retention_stats = raw_retention_stats['stage_level_counts'].
        select{|stage_id, _stage_data| @stage_ids.include? stage_id.to_i}
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

  # Returns an array of arrays, each inner array including the raw responses to
  # the diversity survey.
  def diversity_survey_raw_responses
    header = [
      "Response ID",
      "American Indian",
      "Asian",
      "Black",
      "Hispanic",
      "Native",
      "White",
      "Other",
      "Foodstamps",
      "System Student Count",
    ]
    raw_responses = [header]

    SurveyResult.all.each do |response|
      this_response = [response['id']]

      data = response['properties']
      this_response << (data.key?('survey2016_ethnicity_american_indian') ?
        data['survey2016_ethnicity_american_indian'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_asian') ?
        data['survey2016_ethnicity_asian'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_black') ?
        data['survey2016_ethnicity_black'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_hispanic') ?
        data['survey2016_ethnicity_hispanic'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_native') ?
        data['survey2016_ethnicity_native'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_white') ?
        data['survey2016_ethnicity_white'].to_i : nil)
      this_response << (data.key?('survey2016_ethnicity_other') ?
        data['survey2016_ethnicity_other'].to_i : nil)

      this_response << (data.key?('survey2016_foodstamps') ?
        data['survey2016_foodstamps'].to_i : nil)

      teachers_student_count = Follower.
        where(user_id: response['user_id']).
        joins('INNER JOIN users ON users.id = followers.student_user_id').
        where('users.last_sign_in_at IS NOT NULL').
        distinct.
        count(:student_user_id)
      this_response << teachers_student_count

      raw_responses << this_response
    end

    raw_responses
  end

  def diversity_survey_csv
    send_data(
      CSV.generate do |csv|
        diversity_survey_raw_responses().each do |response|
          csv << response
        end
        csv
      end,
      :type => 'text/csv')
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
