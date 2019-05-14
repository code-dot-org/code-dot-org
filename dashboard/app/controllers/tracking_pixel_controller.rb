require 'cdo/firehose'

class TrackingPixelController < ApplicationController
  def index
    prevent_caching
    curriculum_page = URI.unescape(params[:from]).split('/').reverse.drop(1).reverse.join('/')
    user_id = current_user&.id || nil

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

    send_file pegasus_dir('sites.v3/code.org/public/images/1x1.png'), type: 'image/png'
  end
end
