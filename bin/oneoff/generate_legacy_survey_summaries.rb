#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'
require 'pd/survey_pipeline/survey_pipeline_helper.rb'

# for pegasus survey summaries
include Api::V1::Pd::WorkshopScoreSummarizer

# for jotform survey summaries
include Pd::SurveyPipeline::Helper

# As we deprecate pegasus- and jotform-based surveys in favour of our in-house Foorm system,
# we want to snapshot certain summaries that we have shown to facilitators in the past.
# This script generates those values and records them in a new Pd::LegacySurveySummary model.

def main
  case ARGV[0]
  when "csf_intro_post_workshop"
    snapshot_csf_intro_post_workshop_from_pegasus
  when "csf_intro_post_workshop_all_workshops"
    snapshot_csf_intro_post_workshop_from_pegasus_for_all_workshops
  when "csd_summer_workshops"
    snapshot_csd_summer_workshops_from_jotform
  when "csp_summer_workshops"
    snapshot_csp_summer_workshops_from_jotform
  else
    puts "Usage: generate_legacy_survey_summaries.rb"
    puts "           csf_intro_post_workshop |"
    puts "           csf_intro_post_workshop_all_workshops |"
    puts "           csd_summer_workshops |"
    puts "           csp_summer_workshops"
  end
end

def snapshot_csf_intro_post_workshop_from_pegasus
  course = Pd::Workshop::COURSE_CSF
  subject = Pd::Workshop::SUBJECT_CSF_101

  # facilitator_id: results
  facilitators = {}

  # let's get all workshops for CSF Intro, that are ended, and not summer
  all_completed_csf_info_workshops = Pd::Workshop.where(course: course, subject: subject).in_state(Pd::Workshop::STATE_ENDED).exclude_summer

  # let's find all facilitators who have done these.  we use a hash with ID as key so that we only
  # record each facilitator once
  all_completed_csf_info_workshops.each do |w|
    w.facilitators.each do |f|
      unless facilitators.key?(f.id)
        facilitators[f.id] = f
      end
    end
  end

  survey_reports = {}

  facilitators.each do |id, f|
    all_their_workshops = Pd::Workshop.facilitated_by(f)
    all_their_completed_workshops = all_their_workshops.where(course: course, subject: subject).in_state(Pd::Workshop::STATE_ENDED).exclude_summer

    all_their_workshops_for_course = get_score_for_workshops(
      workshops: all_their_completed_workshops,
      include_free_responses: false,
      facilitator_name_filter: f.name
    )

    survey_reports[id] = all_their_workshops_for_course
  end

  # delete all existing
  Pd::LegacySurveySummary.where.not(facilitator_id: nil).where(course: course, subject: subject).delete_all

  # write all entries
  survey_reports.each_pair do |id, report|
    puts "f_id: #{id}, course: #{course}, subject: #{subject}"
    pp report.to_json
    puts

    Pd::LegacySurveySummary.create(facilitator_id: id, course: course, subject: subject, data: report.to_json)
  end
end

def snapshot_csf_intro_post_workshop_from_pegasus_for_all_workshops
  course = Pd::Workshop::COURSE_CSF
  subject = Pd::Workshop::SUBJECT_CSF_101

  aggregate_for_all_workshops = JSON.parse(AWS::S3.download_from_bucket('pd-workshop-surveys', "aggregate-workshop-scores-#{CDO.rack_env}"))
  survey_report_all_workshops = aggregate_for_all_workshops[course].try(&:symbolize_keys) || {}

  # delete all existing
  Pd::LegacySurveySummary.where(facilitator_id: nil).where(course: course, subject: subject).delete_all

  # write all entries
  puts "f_id: nil, course: #{course}, subject: #{subject}"
  pp survey_report_all_workshops.to_json

  Pd::LegacySurveySummary.create(facilitator_id: nil, course: course, subject: subject, data: survey_report_all_workshops.to_json)
end

def snapshot_csd_summer_workshops_from_jotform
  snapshot_summer_workshops_from_jotform(Pd::Workshop::COURSE_CSD)
end

def snapshot_csp_summer_workshops_from_jotform
  snapshot_summer_workshops_from_jotform(Pd::Workshop::COURSE_CSP)
end

def snapshot_summer_workshops_from_jotform(course)
  subject = Pd::Workshop::SUBJECT_SUMMER_WORKSHOP

  facilitators = {}

  # let's get all workshops for the course, that are 5-day summer
  all_completed_csd_csp_summer_workshops = Pd::Workshop.where(course: course, subject: subject).in_state(Pd::Workshop::STATE_ENDED)

  # let's find all facilitators who have done these.  we use a hash with ID as key so that we only
  # record each facilitator once
  all_completed_csd_csp_summer_workshops.each do |w|
    w.facilitators.each do |f|
      unless facilitators.key?(f.id)
        facilitators[f.id] = f
      end
    end
  end

  survey_reports = {}

  facilitators.each do |id, f|
    all_their_workshops = Pd::Workshop.facilitated_by(f)
    all_their_completed_workshops = all_their_workshops.where(course: course, subject: subject).in_state(Pd::Workshop::STATE_ENDED)

    facilitator_report = {}

    unless all_their_completed_workshops.empty?
      # Do workshop rollups, then facilitator rollups.
      [false, true].each do |only_facilitator_questions|
        rollup = report_facilitator_rollup(id, all_their_completed_workshops.first, only_facilitator_questions)

        key = "facilitator_#{id}_all_ws"
        rollup[:rollups][key][:averages].each do |string_key, average|
          # We have found a string_key and an average, now find out the actual string for the key
          question_text = rollup[:questions][string_key]
          unless question_text.nil?
            facilitator_report[question_text] = average
          end
        end
      end
    end

    survey_reports[id] = facilitator_report
  end

  # delete all existing
  Pd::LegacySurveySummary.where(course: course, subject: subject).delete_all

  # write all entries
  survey_reports.each_pair do |id, report|
    puts "f_id: #{id}, course: #{course}, subject: #{subject}"
    pp report.to_json
    puts

    Pd::LegacySurveySummary.create(facilitator_id: id, course: course, subject: subject, data: report.to_json)
  end
end

main
