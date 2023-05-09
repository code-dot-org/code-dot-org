FactoryBot.define do
  factory :contact_rollups_raw do
    sequence(:email) {|n| "contact_#{n}@example.domain"}
    sequence(:sources) {|n| "dashboard.table_#{n}"}
    data {{opt_in: true}}
    data_updated_at {Time.now.utc}
  end

  factory :contact_rollups_processed do
    transient do
      data_updated_at {Time.now.utc}
    end

    sequence(:email) {|n| "contact_#{n}@example.domain"}
    data {{'opt_in' => true}}

    after(:build) do |contact, evaluator|
      contact.data[:updated_at] = evaluator.data_updated_at
    end
  end

  factory :contact_rollups_final do
    sequence(:email) {|n| "contact_#{n}@example.domain"}
    data {{'opt_in' => true}}
  end

  factory :contact_rollups_pardot_memory do
    sequence(:email) {|n| "contact_#{n}@example.domain"}
    sequence(:pardot_id) {|n| n}
    pardot_id_updated_at {Time.now.utc - 1.hour}
    data_synced {{db_Opt_In: 'No'}}
    data_synced_at {Time.now.utc}
  end
end
