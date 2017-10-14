require pegasus_dir 'forms/hoc_signup_2017'

class HocCensus2017 < HocSignup2017
  def self.normalize(data)
    result = super
    # Once the change to split hoc signup and hoc census has been deployed we
    # can move the census specific data extraction here. For now we want the
    # old signup form to continue recording census data and we don't want to
    # duplicate the data extraction here.

    result
  end

  def self.receipt
    'census_form_receipt'
  end
end
