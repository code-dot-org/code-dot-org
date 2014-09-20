require 'cdo/geocoder'

class HourOfActivity
  include DataMapper::Resource

  property :id              , Serial
  property :session         , String    , :unique_index=>:u, :required=>true
  property :referer         , String    , :required=>true
  property :tutorial        , String
  property :started         , Boolean   , :default=>false
  property :pixel_started   , Boolean   , :default=>false
  property :pixel_finished  , Boolean   , :default=>false
  property :finished        , Boolean   , :default=>false
  property :email           , String    , :format=>:email_address
  property :name            , String
  property :vote            , String
  property :country         , String
  property :state           , String
  property :city            , String
  property :latitude        , String
  property :longitude       , String

  property :created_at      , DateTime  # Automated by dm-timestampes
  property :created_on      , Date      # Automated by dm-timestampes
  property :create_ip       , String
  property :updated_at      , DateTime  # Automated by dm-timestampes
  property :updated_on      , Date      # Automated by dm-timestampes
  property :update_ip       , String

  def self.stat(row)
    {
      :session          => row ? row.session : nil,
      :started          => row ? row.started : false,
      :pixel_started    => row ? row.pixel_started : false,
      :pixel_finished   => row ? row.pixel_finished : false,
      :finished         => row ? row.finished : false,
      :certificate_sent => row ? (!row.email.nil? && !row.email.empty?) : false,
      :has_voted        => row ? (!row.vote.nil? && !row.vote.empty?) : false,
    }
  end

  def self.row_created(row)
    $log.debug "Looking up geolocation for #{row.create_ip}"
    results = Geocoder.search(row.create_ip)
    unless results.empty?
      location = results.first
      $log.debug "#{row.create_ip} is located in #{location.city}, #{location.state} #{location.country}"
      row.country = location.country
      row.state = location.state
      row.city = location.city
      row.latitude = location.latitude
      row.longitude = location.longitude
      row.save
    end
  end
end
