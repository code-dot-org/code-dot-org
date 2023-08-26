Dir[File.expand_path('../apps/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      def self.sync_in
        Animations.sync_in
        ExternalSources.sync_in
        Labs.sync_in
      end
    end
  end
end
