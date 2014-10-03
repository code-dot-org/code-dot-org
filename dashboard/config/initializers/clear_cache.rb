# Clear the Rails cache on application startup.
begin
  Rails.cache.clear
rescue SystemCallError
# ignored
end
