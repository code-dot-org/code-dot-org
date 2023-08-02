#!/usr/bin/env ruby
require_relative '../../dashboard/config/environment'
require 'optparse'

@trial_run = true
@verbose = false

def to_bool(s)
  if ['1', 'on', 'true', true].include? s
    true
  elsif ['0', '', 'false', false, nil].include? s
    false
  else
    raise "Invalid boolean #{s}"
  end
end

include SchoolInfoDeduplicator

# SchoolInfoDeduplicator expects to have an object passed in that can have a school info set on it
# This class serves that purpose so we can then extract the school info object to use.
class SchoolInfoCatcher
  attr_accessor :school_info
end

def create_school_info(data, processed_data)
  school_id = data['nces_school_s']
  # '-1' is the indicator that the user couldn't find the school in the dropdown
  school = School.find(school_id) if school_id.presence && school_id != '-1'
  if school
    attrs = {school_id: school.id}
  else
    # We get slightly different fields depending on which form we are coming from.
    #
    # From /yourschool we get:
    #   country_s
    #   nces_school_s
    #   school_type_s
    #   school_state_s
    #   school_district_id_s
    #   school_district_other_b
    #   school_district_name_s
    #   school_id_s
    #   school_other_b
    #   school_name_s
    #   school_zip_s
    #   school_full_address_s
    #
    # From HoC signup we get only:
    #   nces_school_s
    #   school_name_s
    #   hoc_event_country_s
    #   event_location_s
    #
    # In that case we can look in the processed_data to find:
    #   location_street_address_s
    #   location_state_code_s
    #   location_country_code_s
    #   location_postal_code_s
    #
    attrs = {
      country: data['country_s'] || data['hoc_event_country_s'] || processed_data['location_country_code_s'],
      school_type: data['school_type'],
      state: data['school_state_s'] || processed_data['location_state_code_s'],
      zip: data['school_zip_s'] || processed_data['location_postal_code_s'],
      school_district_id: data['school_district_id_s'],
      school_district_other: to_bool(data['school_district_other_b']).to_s,
      school_district_name: data['school_district_name_s'],
      school_other: to_bool(data['school_other_b']).to_s,
      school_name: data['school_name_s'],
      full_address: data['school_full_address_s'] || processed_data['location_street_address_s'],
      validation_type: SchoolInfo::VALIDATION_NONE
    }

    # The form allowed invalid (non-numeric) zip codes but the model requires an integer greater than 0
    # Rather than fail to migrate the full record we just remove any bad zip codes
    attrs[:zip] = nil if attrs[:zip].to_i <= 0
  end

  puts "Creating school_info with attrs: #{attrs}" if @verbose

  catcher = SchoolInfoCatcher.new
  school_info =
    if deduplicate_school_info(attrs, catcher)
      catcher.school_info
    else
      SchoolInfo.new attrs
    end

  unless school_info.valid?
    raise "Invalid school_info: #{school_info.errors.full_messages} attrs: #{attrs}"
  end

  school_info
end

#
# From HoC signup we get a value that is compatible with the model validation logic ("teacher", "administrator", etc.)
# But from /yourschool the value is the same as the display string. In English that is "Teacher", "Administrator", etc.
# In other languages it is the string in that language.  This is the case for role, "how many", and class frequency
# The following methods are used to map from the values seen in the production data to the cannonical values.
#
def cleanup_role(role)
  {
    "teacher" => Census::CensusSubmission::ROLES[:teacher],
    "administrator" => Census::CensusSubmission::ROLES[:administrator],
    "parent" => Census::CensusSubmission::ROLES[:parent],
    "volunteer" => Census::CensusSubmission::ROLES[:volunteer],
    "other" => Census::CensusSubmission::ROLES[:other],
    "Teacher" => Census::CensusSubmission::ROLES[:teacher],
    "Administrator" => Census::CensusSubmission::ROLES[:administrator],
    "Parent" => Census::CensusSubmission::ROLES[:parent],
    "Volunteer" => Census::CensusSubmission::ROLES[:volunteer],
    "Volunteer/Community Advocate" => Census::CensusSubmission::ROLES[:volunteer],
    "Other" => Census::CensusSubmission::ROLES[:other],
    "管理员" => Census::CensusSubmission::ROLES[:administrator],
    "Insegnante" => Census::CensusSubmission::ROLES[:teacher],
    "Nauczyciel" => Census::CensusSubmission::ROLES[:teacher],
    "Καθηγητής" =>  Census::CensusSubmission::ROLES[:teacher],
    "Andere" => Census::CensusSubmission::ROLES[:other],
    "Anders" => Census::CensusSubmission::ROLES[:other],
    "Ouder" => Census::CensusSubmission::ROLES[:parent],
    "Ostatní" => Census::CensusSubmission::ROLES[:other],
    "管理員" => Census::CensusSubmission::ROLES[:administrator],
    "Diğer" => Census::CensusSubmission::ROLES[:other],
    "Profesor" => Census::CensusSubmission::ROLES[:teacher],
    "Padre/madre" => Census::CensusSubmission::ROLES[:parent],
    "Pai / Mãe" => Census::CensusSubmission::ROLES[:parent],
    "Учитель" => Census::CensusSubmission::ROLES[:teacher],
    "Autres" => Census::CensusSubmission::ROLES[:other],
    "Alte" => Census::CensusSubmission::ROLES[:other],
    "Altro" => Census::CensusSubmission::ROLES[:other],
    "Andre" => Census::CensusSubmission::ROLES[:other],
    "Annat" => Census::CensusSubmission::ROLES[:other],
    "Citi" => Census::CensusSubmission::ROLES[:other],
    "Drugi" => Census::CensusSubmission::ROLES[:other],
    "Egyéb" => Census::CensusSubmission::ROLES[:other],
    "Kita" => Census::CensusSubmission::ROLES[:other],
    "Lärare" => Census::CensusSubmission::ROLES[:teacher],
    "Muu" => Census::CensusSubmission::ROLES[:other],
    "Ostalo" => Census::CensusSubmission::ROLES[:other],
    "Otros" => Census::CensusSubmission::ROLES[:other],
    "Outros" => Census::CensusSubmission::ROLES[:other],
    "Padres" => Census::CensusSubmission::ROLES[:parent],
    "Părinte" => Census::CensusSubmission::ROLES[:parent],
    "Tjetër" => Census::CensusSubmission::ROLES[:other],
    "Učitelj" => Census::CensusSubmission::ROLES[:teacher],
    "Öğretmen" => Census::CensusSubmission::ROLES[:teacher],
    "家長" => Census::CensusSubmission::ROLES[:parent],
    "אחר" => Census::CensusSubmission::ROLES[:parent],
    "Друго" => Census::CensusSubmission::ROLES[:parent],
    "වෙනත්" => Census::CensusSubmission::ROLES[:other],
    "المدرس" => Census::CensusSubmission::ROLES[:teacher]
  }[role]
end

def cleanup_how_many(how_many)
  {
    "none" => Census::CensusSubmission::HOW_MANY_OPTIONS[:none],
    "some" => Census::CensusSubmission::HOW_MANY_OPTIONS[:some],
    "all" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "dont_know" => Census::CensusSubmission::HOW_MANY_OPTIONS[:dont_know],
    "None" => Census::CensusSubmission::HOW_MANY_OPTIONS[:none],
    "Some" => Census::CensusSubmission::HOW_MANY_OPTIONS[:some],
    "All" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "I don't know" => Census::CensusSubmission::HOW_MANY_OPTIONS[:dont_know],
    "全部" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Tutti" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Wszystko" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Ολα" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Ich weiß nicht" => Census::CensusSubmission::HOW_MANY_OPTIONS[:dont_know],
    "Alle" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Geen" => Census::CensusSubmission::HOW_MANY_OPTIONS[:none],
    "Vše" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Nessuno" => Census::CensusSubmission::HOW_MANY_OPTIONS[:none],
    "Всичи" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Todos" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "一些" => Census::CensusSubmission::HOW_MANY_OPTIONS[:some],
    "Tout" => Census::CensusSubmission::HOW_MANY_OPTIONS[:all],
    "Bilmiyorum" => Census::CensusSubmission::HOW_MANY_OPTIONS[:dont_know]
  }[how_many]
end

def cleanup_frequency(frequency)
  {
    "less_than_one" => Census::CensusSubmission::CLASS_FREQUENCIES[:less_than_one_hour_per_week],
    "one_to_three" => Census::CensusSubmission::CLASS_FREQUENCIES[:one_to_three_hours_per_week],
    "three_plus" => Census::CensusSubmission::CLASS_FREQUENCIES[:three_plus_hours_per_week],
    "dont_know" => Census::CensusSubmission::CLASS_FREQUENCIES[:dont_know],
    "< 1 hour per week" => Census::CensusSubmission::CLASS_FREQUENCIES[:less_than_one_hour_per_week],
    "1-3 hours per week" => Census::CensusSubmission::CLASS_FREQUENCIES[:one_to_three_hours_per_week],
    "3+ hours per week" => Census::CensusSubmission::CLASS_FREQUENCIES[:three_plus_hours_per_week],
    "I don't know" => Census::CensusSubmission::CLASS_FREQUENCIES[:dont_know],
    "haftada 1 saatten az" => Census::CensusSubmission::CLASS_FREQUENCIES[:less_than_one_hour_per_week],
    "< 1 valanda per savaitę" => Census::CensusSubmission::CLASS_FREQUENCIES[:less_than_one_hour_per_week],
    "1-3 Stunden pro Woche" => Census::CensusSubmission::CLASS_FREQUENCIES[:one_to_three_hours_per_week],
    "1-3 uur per week" => Census::CensusSubmission::CLASS_FREQUENCIES[:one_to_three_hours_per_week],
    "haftada 1 ile 3 saat arası" => Census::CensusSubmission::CLASS_FREQUENCIES[:one_to_three_hours_per_week],
    "3 o più ore alla settimana" => Census::CensusSubmission::CLASS_FREQUENCIES[:three_plus_hours_per_week]
  }[frequency]
end

# Mapping from form key to census key
@census_field_mappings = {
  'email_s' => :submitter_email_address,
  'name_s' => :submitter_name,
  'role_s' => :submitter_role,
  'hoc_s' => :how_many_do_hoc,
  'after_school_s' => :how_many_after_school,
  'ten_hours_s' => :how_many_10_hours,
  'twenty_hours_s' => :how_many_20_hours,
  'other_cs_b' => :other_classes_under_20_hours,
  'topic_blocks_b' => :topic_blocks,
  'topic_text_b' => :topic_text,
  'topic_robots_b' => :topic_robots,
  'topic_internet_b' => :topic_internet,
  'topic_security_b' => :topic_security,
  'topic_data_b' => :topic_data,
  'topic_web_design_b' => :topic_web_design,
  'topic_game_design_b' => :topic_game_design,
  'topic_other_b' => :topic_other,
  'topic_other_desc_s' => :topic_other_description,
  'topic_dont_know_b' => :topic_do_not_know,
  'followup_frequency_s' => :class_frequency,
  'followup_more_s' => :tell_us_more,
  'pledge_b' => :pledged
}

# These are the fields that do not also appear on the Hour of Code signup form
@census_only_fields = [
  :submitter_role,
  :how_many_do_hoc,
  :how_many_after_school,
  :how_many_10_hours,
  :how_many_20_hours,
  :other_classes_under_20_hours,
  :topic_blocks,
  :topic_text,
  :topic_robots,
  :topic_internet,
  :topic_security,
  :topic_data,
  :topic_web_design,
  :topic_game_design,
  :topic_other,
  :topic_other_description,
  :topic_do_not_know,
  :class_frequency,
  :tell_us_more,
  :pledged
]

#
# Older versions of the form had a set of checkboxes for the "how many" questions.
# Form validation required that at least on be checked.
#
def has_how_many_checkboxes?(data)
  (
    data["cs_none_b"] ||
    data["hoc_some_b"] ||
    data["hoc_all_b"] ||
    data["ten_hr_some_b"] ||
    data["ten_hr_all_b"] ||
    data["twenty_hr_some_b"] ||
    data["twenty_hr_all_b"] ||
    data["cs_dont_know_b"] ||
    data["other_course_b"]
  )
end

def extract_census_data(form)
  data = JSON.parse(form[:data])
  puts "Extracting census_data from #{data}" if @verbose
  processed_data = JSON.parse(form[:processed_data])

  census_data = {}
  census_data[:school_year] = 2017 # All of the data we are migrating is for the 2017-2018 school year
  school_info = create_school_info(data, processed_data)
  census_data[:school_infos] = [school_info]
  @census_field_mappings.each do |form_key, census_key|
    form_data = data[form_key]
    puts "Mapping data[#{form_key}] (#{form_data}) to #{census_key} for form #{form[:id]}" if @verbose
    census_data[census_key] = form_data if form_data
  end

  # There are various ways of indicating true/false in the forms.
  # Call a helper method to translate to a boolean value
  [:other_classes_under_20_hours,
   :topic_blocks,
   :topic_text,
   :topic_robots,
   :topic_internet,
   :topic_security,
   :topic_data,
   :topic_web_design,
   :topic_game_design,
   :topic_other,
   :topic_do_not_know,
   :pledged].each do |key|
    census_data[key] = to_bool(census_data[key])
  end

  how_many_keys = [:how_many_do_hoc, :how_many_after_school, :how_many_10_hours, :how_many_20_hours]
  how_many_keys.each do |key|
    census_data[key] = cleanup_how_many(census_data[key])
  end

  # Older version of the census form used checkboxes instead of dropdowns
  # Here we map from the checkbox options to the dropdown style values we want to store
  # Since the interface allowed for inconsistent settings we will prefer the specific
  # question value over a general "none" answer which in turn overrides a general "dont_know"
  if data["cs_dont_know_b"] == "on"
    how_many_keys.each do |key|
      census_data[key] = Census::CensusSubmission::HOW_MANY_OPTIONS[:dont_know]
    end
  end
  if data["cs_none_b"] == "on"
    how_many_keys.each do |key|
      census_data[key] = Census::CensusSubmission::HOW_MANY_OPTIONS[:none]
    end
  end
  census_data[:how_many_do_hoc] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["hoc_some_b"] == "on"
  census_data[:how_many_do_hoc] = Census::CensusSubmission::HOW_MANY_OPTIONS[:all] if data["hoc_all_b"] == "on"
  census_data[:how_many_10_hours] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["ten_hr_some_b"] == "on"
  census_data[:how_many_10_hours] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["ten_hr_all_b"] == "on"
  census_data[:how_many_20_hours] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["twenty_hr_some_b"] == "on"
  census_data[:how_many_20_hours] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["twenty_hr_all_b"] == "on"
  census_data[:how_many_after_school] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["after_school_some_b"] == "on"
  census_data[:how_many_after_school] = Census::CensusSubmission::HOW_MANY_OPTIONS[:some] if data["after_school_all_b"] == "on"

  census_data[:class_frequency] = cleanup_frequency(census_data[:class_frequency])
  census_data[:submitter_role] = cleanup_role(census_data[:submitter_role])

  # The pledge checkbox is shown to teacher and admins but no value is posted if it isn't checked.
  if ['teacher', 'administrator'].include?(census_data[:submitter_role]) && census_data[:pledged].nil?
    census_data[:pledged] = false
  end

  # We want to preserve the creation timestamp from the original submission
  census_data[:created_at] = form[:created_at]

  {
    census_data: census_data,
    form_data: data,
    form_processed_data: processed_data
  }
end

# Check if there are answers submitted for any of the followup questions.
def has_any_followups?(data)
  (
    data['topic_blocks_b'] ||
    data['topic_text_b'] ||
    data['topic_robots_b'] ||
    data['topic_internet_b'] ||
    data['topic_security_b'] ||
    data['topic_data_b'] ||
    data['topic_web_design_b'] ||
    data['topic_game_design_b'] ||
    data['topic_other_b'] ||
    data['topic_other_desc_s'] ||
    data['topic_dont_know_b'] ||
    data['followup_frequency_s'] ||
    data['followup_more_s']
  )
end

@census_form_kinds = ['HocSignup2017', 'HocCensus2017', 'Census2017']

def process_form(form)
  kind = form[:kind]
  raise "Unsupported kind: #{kind}" unless @census_form_kinds.include?(kind)

  ActiveRecord::Base.transaction do
    extracted_data = extract_census_data(form)
    census_data = extracted_data[:census_data]
    form_data = extracted_data[:form_data]
    no_school = form_data['nces_school_s'].nil?

    case kind
    when 'HocSignup2017'
      # There was a period of time where we were saving all the census fields on Hour of Code signups
      # even after we split into two forms. If all of those extra fields are empty then we can skip
      # processing the form.
      return if census_data.none? {|k, v| v.presence && @census_only_fields.include?(k)}
      submission = Census::CensusHoc2017v1.new census_data
    when 'HocCensus2017'
      submission =
        if no_school
          Census::CensusHoc2017v2.new census_data
        else
          Census::CensusHoc2017v3.new census_data
        end
    when 'Census2017'
      submission =
        if form_data['version'] == "4" || form_data['version_s'] == "4"
          Census::CensusYourSchool2017v4.new census_data
        elsif has_how_many_checkboxes?(form_data)
          Census::CensusYourSchool2017v0.new census_data
        elsif no_school && has_any_followups?(form_data) && form_data['topic_other_desc_s'].nil?
          # We many incorrectly classify some v1 submissions as v2 if followup questions were not shown.
          # The submissions are indistinquishable in that case.
          Census::CensusYourSchool2017v1.new census_data
        elsif no_school
          Census::CensusYourSchool2017v2.new census_data
        else
          Census::CensusYourSchool2017v3.new census_data
        end
    else
      raise "Unexpected form kind: #{kind}"
    end

    if @trial_run
      valid = submission.valid?
      raise "Invalid #{submission.class} submission: #{submission.errors.full_messages} census_data: #{census_data}" unless valid
    else
      submission.save!
      Census::CensusSubmissionFormMap.create!(
        census_submission: submission,
        form_id: form[:id]
      )
    end
  end
end

OptionParser.new do |opts|
  opts.on('-w', '--write', 'Write to the DB.') do
    @trial_run = false
  end
  opts.on('-v', '--verbose', 'Print detailed information.') do
    @verbose = true
  end
end.parse!

unless @trial_run
  puts "WARNING: This is not a trial run. This run will update the DB."
  puts "Press ENTER to continue"
  gets
end

successes = 0
failures = 0
skips = 0
unprocessed = 0
DB[:forms].where(kind: @census_form_kinds).each do |form|
  form_id = form[:id]
  if form[:processed_data].nil?
    puts "Skipping form #{form_id} since it has no processed_data yet." if @verbose
    unprocessed += 1
    next
  end
  previous_migrations = Census::CensusSubmissionFormMap.where(form_id: form_id)
  if previous_migrations.empty?
    process_form(form)
    successes += 1
  else
    puts "Skipping form #{form_id} becasue it has already been migrated to census submission #{previous_migrations[0].census_submission_id}" if @verbose
    skips += 1
  end
rescue Exception => exception
  puts "Error processing form id #{form[:id]}: #{exception.message}"
  puts exception.backtrace if @verbose
  failures += 1
end

puts "Skipped #{skips} forms that were already migrated and #{unprocessed} that don't have processed_data."
puts "Processed #{successes} forms successfully and #{failures} forms with errors."
