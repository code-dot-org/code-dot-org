Sequel.migration do
  # The StudentNomination and TeacherNomination data is backed up on s3 via the `sotm_totm.csv` file
  # in the `deprecated-data` bucket. In case of emergency, this migration could be reversed by
  # importing the data in that file to the DB.
  up do
    from(:forms).where(kind: 'StudentNomination').delete
    from(:forms).where(kind: 'TeacherNomination').delete
  end
end
