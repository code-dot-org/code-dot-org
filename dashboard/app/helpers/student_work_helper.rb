# This module contains helper methods for retrieving and evaluating student work.
module StudentWorkHelper
  def self.get_student_code(user_id, level, unit_id, code_version = nil)
    s3 = Aws::S3::Client.new
    bucket = CDO.sources_s3_bucket
    base_dir = CDO.sources_s3_directory

    storage_id = storage_id_for_user_id(user_id)
    storage_app_id = get_storage_app_id(storage_id, user_id, level, unit_id)
    user_level = UserLevel.where(user_id: user_id, level_id: level.id, script_id: unit_id).last
    if user_level && storage_app_id
      s3_filename = "#{base_dir}/#{storage_id}/#{storage_app_id}/main.json"
      s3_args = {bucket: bucket, key: s3_filename}
      s3_args[:version_id] = code_version if code_version
      begin
        body = s3.get_object(s3_args)[:body].read
      rescue => exception
        Honeybadger.notify(exception, context: {message: "No code sample found in S3 with with args: #{s3_args}"})
        return
      end
      channel_id = storage_encrypt_channel_id(storage_id, storage_app_id)
      student_code = body ? JSON.parse(body)['source'] : nil
    end
    {
      project_id: channel_id,
      code_version: code_version,
      student_code: student_code,
    }
  end

  def self.get_storage_app_id(storage_id, user_id, level, unit_id)
    # For project-template-backed levels, we need to use the channel_token for the associated project template level.
    level_id_for_channel_token = level.project_template_level ? level.project_template_level.id : level.id
    channel_token = ChannelToken.where(storage_id: storage_id, level_id: level_id_for_channel_token, script_id: unit_id).last
    channel_token&.storage_app_id
  end
end
