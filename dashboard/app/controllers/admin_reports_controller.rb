require 'cdo/env'
require 'cdo/properties'

# The controller for reports of internal admin-only data.
class AdminReportsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  before_action :set_script

  def directory
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
          next unless level_info && level_info[0] == 'Multi' && !level_info[1].empty?
          level_answers = level_info[1]["answers"]
          @responses[level_id].each do |response|
            response[2] = level_answers[response[2].to_i]["text"]
          end
        end
      end

      respond_to do |format|
        format.html
        format.csv {return level_answers_csv}
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
        filter += ";ga:eventLabel=@#{params[:filter].to_s.tr('_', '/')}"
      end
      ga_data = GAClient.query_ga(@start_date, @end_date, dimension, metric, filter)

      @is_sampled ||= ga_data.contains_sampled_data

      ga_data.rows.each do |r|
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

    page_data = Hash[GAClient.query_ga(@start_date, @end_date, 'ga:pagePath', 'ga:avgTimeOnPage', 'ga:pagePath=~^/s/|^/flappy/|^/hoc/').rows]

    data_array = output_data.map do |key, value|
      {'Puzzle' => key}.merge(value).merge('timeOnSite' => page_data[key] && page_data[key].to_i)
    end
    require 'naturally'
    data_array = data_array.select {|x| x['TotalAttempt'].to_i > 10}.sort_by {|i| Naturally.normalize(i.send(:fetch, 'Puzzle'))}
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
    script_id_or_name = params[:script] || 'K5PD'
    begin
      script = Script.get_from_cache(script_id_or_name)
    rescue ActiveRecord::RecordNotFound
      render(
        layout: 'application',
        html: "Script #{script_id_or_name} not found.",
        status: 404
      ) && return
    end

    SeamlessDatabasePool.use_persistent_read_connection do
      locals_options = Properties.get("pd_progress_#{script.id}")
      if locals_options
        render locals: locals_options.symbolize_keys
      else
        sanitized_script_name = ActionController::Base.helpers.sanitize(
          script.name
        )
        render(
          layout: 'application',
          html: "PD progress data not found for #{sanitized_script_name}.",
          status: 404
        )
      end
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_script
    @script = Script.get_from_cache(params[:script_id]) if params[:script_id]
  end

  private

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
      type: 'text/csv'
    )
  end
end
