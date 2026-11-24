require 'cdo/env'

# The controller for reports of internal admin-only data.
class AdminReportsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  def directory
  end

  def level_answers
    ActiveRecord::Base.connected_to(role: :reading) do
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
          level_info = Level.where(id: level_id).pick(:type, :properties)
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

  private def level_answers_csv
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
