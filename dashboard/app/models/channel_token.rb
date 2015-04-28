class ChannelToken < ActiveRecord::Base
  belongs_to :user
  belongs_to :level

  def self.unique_for_user_and_level(user, host_level)
    # If `create` fails because it was beat by a competing request, a second `find_by` should succeed.
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      ChannelToken.find_or_create_by!(level: host_level, user: user) do |channel_token|
        # Get a new channel_id.
        channel_token.channel = ChannelsApi.call request.env.merge(
          'REQUEST_METHOD' => 'POST',
          'PATH_INFO' => '/v3/channels',
          'REQUEST_PATH' => '/v3/channels',
          'CONTENT_TYPE' => 'application/json;charset=utf-8',
          'rack.input' => StringIO.new('{"hidden":"true"}')
        )[1]['Location'].split('/').last
      end
    end
  end
end
