# This migration drops the uniqueness constraint on email for the contacts
# table. As of July 2016, this constraint seems to exist on development
# environments only.

# WARNING: This migration, though reversible, does not attempt to readd the
# uniqueness constraint in the down direction.

Sequel.migration do
  up do
    if DB.indexes(:contacts)[:email] &&
      DB.indexes(:contacts)[:email].key?(:unique)
      alter_table(:contacts) do
        drop_constraint(:email, type: :unique)
      end
    end
  end
end
