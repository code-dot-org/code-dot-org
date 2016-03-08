require 'cdo/db'
DB = PEGASUS_DB

class Languages

  @@table = DB[:cdo_languages]

  def self.get_crowdin_languages()
    @@table.select(:crowdin_code_s, :crowdin_name_s).where("crowdin_code_s != 'en'")
  end

end
