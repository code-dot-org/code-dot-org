class File
  
  def self.find_first_existing(*paths)
    paths.flatten.find{|path| File.exists?(path) ? path : nil}
  end

end
