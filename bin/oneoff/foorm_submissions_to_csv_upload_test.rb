# NOTE: should not be merged to staging!

# Methods to test performance of writing all foorm submissions
# to CSV on a production clone.

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
