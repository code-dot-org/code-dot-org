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
      # /es-mx/csf-1718/coursec/10/'
      split_url = curriculum_page.split('/').reject(&:empty?)
      # ["csf-18", "pre-express", "11"]
      # ["es-mx", "csf-1718", "coursec", "10"]

      non_en = split_url[0]&.length == 5 && !!split_url[0].match(/\S{2}-\S{2}/)

      locale = non_en ? split_url.shift : "en-us"

      unless split_url.empty?
        # csf, csd, csp including version year, algebra or hoc
        csx = split_url[0]
      end

      if split_url.length > 1
        # csf -> coursea, courseb, ..., pre-express, express
        # csd/csp -> unit1, unit2, ...
        # algebra -> courseA, courseB
        # hoc -> plugged, unplugged
        course_or_unit = split_url[1]
      end

      if split_url.length > 2
        # lesson number, standards, vocab, resources
        lesson = split_url[2]
      end

      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: STUDY_NAME,
          study_group: 'v1',
          event: EVENT_NAME,
          user_id: user_id,
          data_string: curriculum_page,
          data_json: {
            locale: locale,
            csx: csx,
            course_or_unit: course_or_unit,
            lesson: lesson
          }.to_json
        }
      )
    end

    send_file dashboard_dir('app/assets/images/1x1.png'), type: 'image/png'
  end
end
