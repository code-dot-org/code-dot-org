require 'cdo/firehose'

class CurriculumTrackingPixelController < ApplicationController
  STUDY_NAME = 'curriculum-builder-page-views'
  EVENT_NAME = 'curriculum-builder-page-view'
  def index
    prevent_caching
    if params[:from]
      curriculum_page = URI.unescape(params[:from])
    end
    user_id = current_user&.id

    if curriculum_page
      FirehoseClient.instance.put_record(
        study: STUDY_NAME,
        study_group: 'v0',
        event: EVENT_NAME,
        data_json: {
          curriculumBuilderUrl: curriculum_page,
          userId: user_id
        }.to_json
      )
    end

    send_file dashboard_dir('app/assets/images/1x1.png'), type: 'image/png'
  end
end
