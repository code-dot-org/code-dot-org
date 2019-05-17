require 'cdo/firehose'

class CurriculumTrackingPixelController < ApplicationController
  def index
    prevent_caching
    curriculum_page = URI.unescape(params[:from])
    user_id = current_user&.id

    FirehoseClient.instance.put_record(
      study: 'curriculum-builder-page-views',
      study_group: 'v0',
      event: 'curriculum-builder-page-view',
      data_json: {
        curriculumBuilderUrl: curriculum_page,
        unplugged: curriculum_page.include?("unplugged"),
        userId: user_id
      }.to_json
    )

    send_file dashboard_dir('app/assets/images/1x1.png'), type: 'image/png'
  end
end
