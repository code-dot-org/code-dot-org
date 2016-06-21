Sequel.migration do
  up do
    run 'ALTER TABLE storage_apps CONVERT TO CHARACTER SET utf8mb4;'
  end

  down do
    run 'ALTER TABLE storage_apps CONVERT TO CHARACTER SET utf8;'
  end
end
