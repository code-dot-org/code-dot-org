# Clear the Rails cache on application startup.
unless Rails.env.production?
  begin
    Rails.cache.clear
  rescue SystemCallError
  # ignored
  end
end
