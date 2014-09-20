class DistrictPartnerInfo
  include DataMapper::Resource

  def self.roles()
    roles_and_config.keys
  end

  def self.roles_and_config()
    {'user'=>'Your information (person filling out form)', 'coordinator'=>'District coordinator of the Code.org program'}
  end

  property :id          , Serial

  # School district information
  property :district_name                       , String  , :required=>true
  property :district_total_schools              , Integer , :required=>true
  property :district_high_schools               , Integer , :required=>true
  property :district_middle_schools             , Integer , :required=>true
  property :district_elementary_schools         , Integer , :required=>true
  property :district_school_year_start_date     , Date    , :required=>true
  property :district_school_year_end_date       , Date    , :required=>true
  property :district_school_year_estimated      , Boolean

  property :district_partner_districts          , String

  # Student count fields are no longer included on the form.
  property :district_total_students             , Integer , :default=>0
  property :district_high_school_students       , Integer
  property :district_middle_school_students     , Integer
  property :district_elementary_school_students , Integer

  # Main district office
  property :office_street_address      , String , :required=>true
  property :office_street_address_2    , String
  property :office_city                , String , :required=>true
  property :office_state               , String , :required=>true
  property :office_postal_code         , String , :required=>true
  property :office_phone               , String , :required=>true
  property :office_fax                 , String , :required=>true
  property :office_website             , String , :required=>true

  # Contact information
  roles.each do |role|
    property :"#{role}_first_name"       , String , :required=>true
    property :"#{role}_last_name"        , String , :required=>true
    property :"#{role}_position"         , String , :required=>true
    property :"#{role}_street_address"   , String , :required=>true
    property :"#{role}_street_address_2" , String
    property :"#{role}_city"             , String , :required=>true
    property :"#{role}_state"            , String , :required=>true
    property :"#{role}_postal_code"      , String , :required=>true
    property :"#{role}_phone"            , String , :required=>true
    property :"#{role}_fax"              , String , :required=>true
    property :"#{role}_email"            , String , :required=>true
  end

  property :coordinator_same_as_user     , Boolean

  # Superintendent fields are no longer included on the form.
  property :superintendent_first_name       , String , :default=>''
  property :superintendent_last_name        , String , :default=>''
  property :superintendent_position         , String , :default=>''
  property :superintendent_street_address   , String , :default=>''
  property :superintendent_street_address_2 , String , :default=>''
  property :superintendent_city             , String , :default=>''
  property :superintendent_state            , String , :default=>''
  property :superintendent_postal_code      , String , :default=>''
  property :superintendent_phone            , String , :default=>''
  property :superintendent_fax              , String , :default=>''
  property :superintendent_email            , String , :default=>''

  # Programs of interest
  property :program_high_school        , Boolean
  property :program_middle_school      , Boolean
  property :program_elementary_school  , Boolean

  # Help
  property :help_create_course_codes                , Boolean
  property :help_identify_high_schools              , Boolean
  property :help_identify_high_schools_number       , Integer
  property :help_identify_middle_schools            , Boolean
  property :help_identify_middle_schools_number     , Integer
  property :help_identify_elementary_schools        , Boolean
  property :help_identify_elementary_schools_number , Integer
  property :help_identify_qualified_teacher         , Integer

  # Commitments
  property :commitment_district_hoc                 , Boolean
  property :commitment_program_director             , Boolean
  property :commitment_working_group                , Boolean
  property :commitment_community_practice           , Boolean
  property :commitment_technology                   , Boolean
  property :commitment_continued_support            , Boolean
  property :commitment_term_sheet                   , Boolean

  # Meta data
  property :created_at  , DateTime  # Automated by dm-timestampes
  property :created_on  , Date      # Automated by dm-timestampes
  property :create_ip   , String
  
  def self.submit(request, params)
    begin
      district_school_year_start_date = Date.strptime(params[:district_school_year_start_date], '%m/%d/%Y')
    rescue
    end
    
    begin
      district_school_year_end_date = Date.strptime(params[:district_school_year_end_date], '%m/%d/%Y')
    rescue
    end

    row = new(params.merge({
      district_school_year_start_date: district_school_year_start_date,
      district_school_year_end_date: district_school_year_end_date,
      create_ip: request.ip,
    }))
    raise ValidationError.new(row) unless row.save

    row
  end
end
