class Form
  include DataMapper::Resource
  property :id, Serial
  property :parent_id, Integer, index:true
  property :secret, String, unique_index: true, required: true
  property :user_id, Integer, index: true
  property :email, String, required: true, length: 255, index: true
  property :name, String, length: 255, index: true
  property :kind, String, required: true, index: true
  property :data, Json, required: true

  property :created_at, DateTime, index:true # Automated by dm-timestampes
  property :created_ip, IPAddress, required: true
  property :updated_at, DateTime, index:true # Automated by dm-timestampes
  property :updated_ip, IPAddress, required: true

  property :processed_at, DateTime, index:true
  property :processed_data, Json
  property :notified_at, DateTime, index:true
  property :indexed_at, DateTime, index:true

  property :review, String, length:50
  property :reviewed_at, DateTime, index:true
  property :reviewed_by, Integer
  property :reviewed_ip, IPAddress
end
