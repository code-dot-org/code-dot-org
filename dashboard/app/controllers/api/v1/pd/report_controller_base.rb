require 'controllers/api/csv_download'
class Api::V1::Pd::ReportControllerBase < ::ApplicationController
  include CsvDownload
end
