#!/usr/bin/env ruby
require_relative '../../dashboard/lib/api/v1/pd/workshop_score_summarizer'
require_relative '../../lib/cdo/only_one'
require_relative '../../dashboard/config/environment'
require 'cdo/aws/s3'

def main
  include Api::V1::Pd::WorkshopScoreSummarizer

  course_scores = {}

  Pd::Workshop::COURSES.each do |course|
    workshops = ::Pd::Workshop.in_state(Pd::Workshop::STATE_ENDED).where(course: course)

    course_scores[course] = WorkshopScoreSummarizer.get_score_for_workshops(workshops)
  end

  AWS::S3.upload_to_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}", course_scores.to_json, no_random: true)
end

main if only_one_running?(__FILE__)
