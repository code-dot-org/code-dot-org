class File

  def self.find_first_existing(*paths)
    paths.flatten.detect{|path| File.exist?(path) ? path : nil}
  end

end
