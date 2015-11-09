require 'aws-sdk'
if !Rails.env.production?
  Thread.new do
    [CDO.activity_queue].each do |queue_name|
      @client = Aws::SQS::Client.new :region => "us-east-1"
      @queue_url = @client.create_queue({
        :queue_name => queue_name,
        :attributes => {
          "MessageRetentionPeriod" => "1209600", # 14 Days
        }
      })
    end
  end
end
