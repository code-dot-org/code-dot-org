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
      # For ease of querying we attempt to parse the url into meaningful chunks.
      # EXAMPLE:
      # /csf-18/pre-express/11/
      split_url = curriculum_page.split('/')
      # ["", "csf-18", "pre-express", "11"]

      if split_url.length > 1
        # csf, csd, csp including version year, algebra or hoc
        csx = split_url[1]
      end

      if split_url.length > 2
        # csf -> coursea, courseb, ..., pre-express, express
        # csd/csp -> unit1, unit2, ...
        # algebra -> courseA, courseB
        # hoc -> plugged, unplugged
        course_or_unit = split_url[2]
      end

      if split_url.length > 3
        # lesson number, standards, vocab, resources
        lesson = split_url[3]
      end

      FirehoseClient.instance.put_record(
        study: STUDY_NAME,
        study_group: 'v1',
        event: EVENT_NAME,
        user_id: user_id,
        data_string: curriculum_page,
        data_json: {
          csx: csx,
          course_or_unit: course_or_unit,
          lesson: lesson
        }.to_json
      )
    end

    send_file dashboard_dir('app/assets/images/1x1.png'), type: 'image/png'
  end
end
