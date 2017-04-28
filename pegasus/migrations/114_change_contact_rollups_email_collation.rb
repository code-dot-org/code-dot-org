Sequel.migration do
  # change the contact_rollups email column to utf8_bin collation order. This is so queries from this table sorted by
  # email get sorted in the exactly the same alphabetization convention as Ruby <=> operator, which is important
  # for contact sync process.
  up {run 'ALTER TABLE contact_rollups MODIFY email VARCHAR(255) COLLATE utf8_bin'}
  down {run 'ALTER TABLE contact_rollups MODIFY email VARCHAR(255) COLLATE utf8_general_ci'}
end
