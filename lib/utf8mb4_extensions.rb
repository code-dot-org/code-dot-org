class String
  def utf8mb4?
    chars.each do |char|
      if char.bytes.length >= 4
        return true
      end
    end
    false
  end

  def strip_utf8mb4
    chars.delete_if do |char|
      char.bytes.length >= 4
    end.join
  end
end
