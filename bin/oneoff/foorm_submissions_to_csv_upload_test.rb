# NOTE: should not be merged to staging!

# Overview:
# Methods to test performance of writing all foorm submissions
# to CSV on a production clone.

##### ATTEMPT #1
# Use existing form.submissions_to_csv method to export a "wide"
# CSV of all submissions for a given form.
# Note this isn't the format that the RED team would like results in,
# but gives a simple performance baseline and confirms that we can read/write to
# S3 as expected.

# Example usage: write_foorm_submissions_csv_to_bucket('cdo-data-sharing-internal')
# Will generate one file per Foorm Form, containing all Submissions for that Form.
def write_foorm_submissions_csv_to_bucket(bucket)
  Foorm::Form.all.each do |form|
    file_name = form.name.tr('/', '-') + form.version.to_s + '.csv'
    AWS::S3.upload_to_bucket(bucket, file_name, form.submissions_to_csv, no_random: true)
  end
end

def write_foorm_submissions_to_directory(directory)
  Foorm::Form.all.each do |form|
    file_path = directory + form.name.tr('/', '-') + form.version.to_s + '.csv'

    # The value returned from form.submissions_to_csv is already a CSV string, so CSV gem not required.
    File.open(file_path, 'w') {|csv| csv.write(form.submissions_to_csv)}
  end
end

##### ATTEMPT #2
# Use existing submission.formatted_answers method to export a "long"
# CSV of all submissions for a given form.

#
# Notes on testing long format
# Started writing all files at 2:20 PM PST
# Finished at 2:41 PM PST
# Still took 12 minutes to process surveys-pd-ayw_workshop_post_survey0.csv

# Example usage: write_foorm_submissions_csv_to_file_and_bucket_long('surveys/pd/summer_workshop_pre_survey')
def write_foorm_submissions_csv_to_file_and_bucket_long(form_name)
  form = Foorm::Form.find_by(name: form_name)
  write_foorm_submissions_csv_to_file_and_bucket_long_for_form(form)
end

def write_foorm_submissions_csv_to_file_and_bucket_long_for_form(form)
  CSV.open('./test.csv', 'wb') do |csv|
    csv << ['submission_id', 'question_key', 'answer']
    form.submissions.each do |submission|
      rows = submission.formatted_answers.map {|question_key, answer| [submission.id, question_key, answer]}
      rows.each {|row| csv << row}
    end
  end
  AWS::S3.upload_to_bucket('cdo-data-sharing-internal', file_name_from_form_name(form), IO.read('./test.csv'), no_random: true)
end

# 'surveys/pd/summer_workshop_pre_survey'
def write_all_foorm_submissions_csv_to_file_and_bucket_long
  Foorm::Form.all.each do |form|
    write_foorm_submissions_csv_to_file_and_bucket_long_for_form(form)
  end
end

def file_name_from_form_name(form)
  form.name.tr('/', '-') + form.version.to_s + '.csv'
end

##### ATTEMPT #3
# Use simplified format that just "flattens" hash containing survey responses.
#
# Result: didn't get performance measure, as I think database cached some queries
# and it returned results really quickly. Or, it's just really fast.

def flatten_hash(hash)
  hash.each_with_object({}) do |(k, v), h|
    if v.is_a? Hash
      flatten_hash(v).map do |h_k, h_v|
        h["#{k}.#{h_k}".to_sym] = h_v
      end
    else
      h[k] = v
    end
  end
end

def write_all_simplified_foorm_submissions_csv_to_file_and_bucket_long
  Foorm::Form.all.each do |form|
    CSV.open('./test.csv', 'wb') do |csv|
      form.submissions.each do |submission|
        parsed_answers = JSON.parse(submission.answers)
        flattened_parsed_answers = flatten_hash(parsed_answers)
        rows = flattened_parsed_answers.map {|question_key, answer_key| [submission.id, question_key, answer_key]}
        rows.each {|row| csv << row}
      end
    end
    AWS::S3.upload_to_bucket('cdo-data-sharing-internal', file_name_from_form_name(form), IO.read('./test.csv'), no_random: true)
  end
end

def write_simplified_foorm_submissions_csv_to_file_and_bucket_long(form_name)
  form = Foorm::Form.find_by(name: form_name)

  CSV.open('./test.csv', 'wb') do |csv|
    form.submissions.each do |submission|
      parsed_answers = JSON.parse(submission.answers)
      flattened_parsed_answers = flatten_hash(parsed_answers)

      rows = flattened_parsed_answers.map {|question_key, answer_key| [submission.id, question_key, answer_key]}
      rows.each {|row| csv << row}
    end
  end
  AWS::S3.upload_to_bucket('cdo-data-sharing-internal', file_name_from_form_name(form), IO.read('./test.csv'), no_random: true)
end

##### PART #4
# Write to Redshift table

# CREATE TABLE public.foorm_submissions_long
# (
#   foorm_submission_id    int,
#   question_key           varchar(256),
#   answer                 varchar(max)
# );
#
# copy public.foorm_submissions_long
# from 's3://cdo-data-sharing-internal/surveys-pd-summer_workshop_pre_survey0.csv'
# iam_role xxx
# CSV
# ignoreheader 1;
# --
# GRANT SELECT, INSERT, DELETE, RULE, TRIGGER, REFERENCES, UPDATE ON public.foorm_submissions_long TO group admin;
# GRANT SELECT ON public.foorm_submissions_long TO group reader_pii;
