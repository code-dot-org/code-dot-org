if defined? Honeybadger
  Honeybadger.configure do |config|
    config.api_key = CDO.dashboard_honeybadger_api_key

    # ignore some more not founds
    %w(Sinatra StorageApps DynamoTable PropertyBag).each do |class_name|
      config.ignore << class_name + "::NotFound"
    end
  end
end
