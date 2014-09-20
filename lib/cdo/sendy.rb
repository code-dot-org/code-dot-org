require 'sequel'

class Sendy

  @@db = nil

  def self.db()
    return @@db unless @@db.nil?
    uri = URI.parse(CDO.sendy_db_writer)
    uri.scheme = 'mysql2'
    @@db = Sequel.connect(uri.to_s)
  end

  def self.subscribers(where=nil)
    db.fetch("SELECT DISTINCT(LOWER(email)) AS email_s FROM subscribers #{where} ORDER BY email_s").map{|i| i[:email_s]}
  end

end
