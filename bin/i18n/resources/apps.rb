require_relative '../metrics'

Dir[File.expand_path('../apps/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      def self.sync_in
        I18n::Metrics.report_runtime('Animations', 'in') {Animations.sync_in}
        I18n::Metrics.report_runtime('ExternalSources', 'in') {ExternalSources.sync_in}
        I18n::Metrics.report_runtime('Labs', 'in') {Labs.sync_in}
      end

      def self.sync_out
        Animations.sync_out
      end
    end
  end
end
