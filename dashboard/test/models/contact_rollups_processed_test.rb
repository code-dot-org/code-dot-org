require 'test_helper'

class ContactRollupsProcessedTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants

  test 'import_from_raw_table creates one row per email' do
    assert 0, ContactRollupsRaw.count
    assert 0, ContactRollupsProcessed.count

    # Create 6 records for 3 unique emails
    create :contact_rollups_raw, email: 'email1@example.domain'
    create_list :contact_rollups_raw, 2, email: 'email2@example.domain'
    create_list :contact_rollups_raw, 3, email: 'email3@example.domain'

    ContactRollupsProcessed.import_from_raw_table

    # Note: having unique email addresses is already guaranteed by table constraint
    assert_equal 3, ContactRollupsProcessed.count
  end

  test 'import_from_raw_table inserts records by batch' do
    unique_email_count = 15
    batch_sizes = [1, 5, 7, 11, 20]

    ContactRollupsRaw.delete_all
    create_list :contact_rollups_raw, unique_email_count

    batch_sizes.each do |batch_size|
      ContactRollupsProcessed.delete_all
      ContactRollupsProcessed.import_from_raw_table(batch_size)
      assert_equal unique_email_count, ContactRollupsProcessed.count, "Failed with batch size of #{batch_size}"
    end
  end

  test 'import_from_raw_table combines data from multiple records' do
    base_time = Time.now.utc
    email = 'email@example.domain'
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.users', data: nil, data_updated_at: base_time - 2.days
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.email_preferences', data: {opt_in: 1}, data_updated_at: base_time - 1.day
    create :contact_rollups_raw, email: email,
      sources: 'dashboard.pd_enrollments', data: {course: COURSE_CSF}, data_updated_at: base_time

    refute ContactRollupsProcessed.find_by_email(email)
    ContactRollupsProcessed.import_from_raw_table

    record = ContactRollupsProcessed.find_by_email!(email)
    assert_equal 1, record.data['opt_in']
    assert_equal COURSE_CSF, record.data['professional_learning_enrolled']
    assert_equal base_time.to_i, Time.parse(record.data['updated_at']).to_i
  end

  test 'import_from_raw_table calls all extraction functions' do
    assert 0, ContactRollupsRaw.count
    create :contact_rollups_raw

    # Each extraction function will be called once per unique email address
    ContactRollupsProcessed.expects(:extract_opt_in).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_user_id).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_professional_learning_enrolled).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_professional_learning_attended).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_hoc_organizer_years).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_forms_submitted).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_form_roles).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_roles).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_state).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_city).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_postal_code).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_country).
      once.returns({})
    ContactRollupsProcessed.expects(:extract_updated_at).
      once.returns({})

    ContactRollupsProcessed.import_from_raw_table
  end

  test 'extract_field' do
    table = 'pegasus.form_geos'
    field = 'state'

    test_cases = [
      # 3 input params are: contact_data, table, field
      {
        # all empty
        input: [{}, nil, nil],
        expected_output: []
      },
      {
        # table exists in contact data but field doesn't
        input: [{table => {}}, table, field],
        expected_output: []
      },
      {
        # field exists in contact data but table doesn't
        input: [{'pegasus.another_table' => {field => [{'value' => 'WA'}]}}, table, field],
        expected_output: []
      },
      {
        # table and field exists in contact data, field value is nil
        input: [{table => {field => [{'value' => nil}]}}, table, field],
        expected_output: [nil]
      },
      {
        # table and field exists in contact data with non-nil value
        input: [{table => {field => [{'value' => 'WA'}]}}, table, field],
        expected_output: ['WA']
      },
      {
        # table and field exist in contact data with multiple non-nil values
        input: [{table => {field => [{'value' => 'WA'}, {'value' => 'OR'}]}}, table, field],
        expected_output: %w[WA OR]
      },
    ]

    test_cases.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_field(*test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_field_latest_value' do
    table = 'dashboard.schools'
    field = 'state'
    base_time = Time.now.utc

    tests = [
      # 3 input params are: contact_data, table, field
      {
        input: [{}, nil, nil],
        expected_output: nil
      },
      {
        input: [
          {
            table => {
              field => [{'value' => 'WA', 'data_updated_at' => base_time}]
            }
          },
          table,
          field
        ],
        expected_output: 'WA'
      },
      {
        input: [
          {
            table => {
              field => [
                {'value' => 'CA', 'data_updated_at' => base_time - 1.day},
                {'value' => 'IL', 'data_updated_at' => base_time},
                {'value' => 'NY', 'data_updated_at' => base_time - 2.days}
              ]
            }
          },
          table,
          field
        ],
        expected_output: 'IL'
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_field_latest_value(*test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_professional_learning_enrolled' do
    contact_data = {
      'dashboard.pd_enrollments' => {
        'course' => [
          {'value' => COURSE_CSF},
          {'value' => COURSE_CSF},
          {'value' => COURSE_CSD},
          {'value' => nil}
        ]
      }
    }
    # output should not contains nil or duplicate values, and should be sorted
    expected_output = {
      professional_learning_enrolled: "#{COURSE_CSD},#{COURSE_CSF}"
    }

    output = ContactRollupsProcessed.extract_professional_learning_enrolled(contact_data)
    assert_equal expected_output, output
  end

  test 'extract_professional_learning_attended' do
    tests = [
      {
        # Input doesn't have 1 of the 2 tables required, and doesn't have any fields required
        input: {'dashboard.followers' => {}},
        expected_output: {}
      },
      {
        # Input has a non-nil valid section type
        input: {
          'dashboard.followers' => {'section_type' => [{'value' => SECTION_TYPE_MAP[COURSE_CSF]}]}
        },
        expected_output: {professional_learning_attended: COURSE_CSF}
      },
      {
        # Input has a non-nil valid course
        input: {
          'dashboard.pd_attendances' => {'course' => [{'value' => COURSE_CSD}]}
        },
        expected_output: {professional_learning_attended: COURSE_CSD}
      },
      {
        # Input contains both nil and multiple non-nil valid values from both required tables
        input: {
          'dashboard.followers' => {
            'section_type' => [
              {'value' => SECTION_TYPE_MAP[COURSE_CSF]},
              {'value' => SECTION_TYPE_MAP[COURSE_ECS]},
              {'value' => nil}
            ]
          },
          'dashboard.pd_attendances' => {
            'course' => [
              {'value' => COURSE_CSD},
              {'value' => COURSE_CSP},
              {'value' => nil}
            ]
          }
        },
        expected_output: {
          professional_learning_attended: "#{COURSE_CSD},#{COURSE_CSF},#{COURSE_CSP},#{COURSE_ECS}"
        }
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_professional_learning_attended test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_roles' do
    users_input = {
      'dashboard.users' => {
        'user_id' => [{'value' => 1}],
        'is_parent' => [{'value' => 1}]
      }
    }
    pd_enrollments_input = {'dashboard.pd_enrollments' => {}}
    pd_attendances_input = {'dashboard.pd_attendances' => {}}
    followers_input = {'dashboard.followers' => {}}
    census_submissions_input = {
      'dashboard.census_submissions' => {
        'submitter_role' => [
          {'value' => Census::CensusSubmission::ROLES[:teacher]},
          {'value' => nil},
        ]
      }
    }
    forms_input = {
      'pegasus.forms' => {
        'kind' => [
          {'value' => 'Petition'},
          {'value' => 'ClassSubmission'},
          {'value' => nil},
        ]
      }
    }
    section_courses_input = {
      'dashboard.sections' => {
        'course_name' => [
          {'value' => 'csp-2020'},
          {'value' => 'csd-2019'},
          {'value' => nil},
        ]
      }
    }
    section_curricula_input = {
      'dashboard.sections' => {
        'curriculum_umbrella' => [
          {'value' => 'CSF'},
          {'value' => 'CSD'},
          {'value' => nil},
        ]
      }
    }
    user_permissions_input = {
      'dashboard.user_permissions' => {
        'permission' => [
          {'value' => 'workshop_organizer'},
          {'value' => 'facilitator'},
          {'value' => nil},
        ]
      }
    }
    all_inputs = {}.
      merge!(users_input).
      merge!(pd_enrollments_input).
      merge!(pd_attendances_input).
      merge!(followers_input).
      merge!(census_submissions_input).
      merge!(forms_input).
      merge!(section_courses_input).
      merge!(section_curricula_input).
      merge!(user_permissions_input)

    tests = [
      {
        input: users_input,
        expected_output: {roles: 'Parent,Teacher'}
      },
      {
        input: pd_enrollments_input,
        expected_output: {roles: 'Teacher'}
      },
      {
        input: pd_attendances_input,
        expected_output: {roles: 'Teacher'}
      },
      {
        input: followers_input,
        expected_output: {roles: 'Teacher'}
      },
      {
        input: census_submissions_input,
        expected_output: {roles: 'Form Submitter,Teacher'}
      },
      {
        input: forms_input,
        expected_output: {roles: 'Form Submitter,Petition Signer,Teacher'}
      },
      {
        input: section_courses_input,
        expected_output: {roles: 'CSD Teacher,CSP Teacher'}
      },
      {
        input: section_curricula_input,
        expected_output: {roles: 'CSD Teacher,CSF Teacher'}
      },
      {
        input: user_permissions_input,
        expected_output: {roles: 'Facilitator,Workshop Organizer'}
      },
      # input has nothing
      {
        input: {}, expected_output: {}
      },
      # input has everything
      {
        input: all_inputs,
        expected_output: {roles: 'CSD Teacher,CSF Teacher,Facilitator,Form Submitter,Parent,Petition Signer,Teacher,Workshop Organizer'}
      },
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_roles test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_state' do
    base_time = Time.now.utc
    form_geos_input = {
      'pegasus.form_geos' => {
        'state' => [
          {'value' => 'Washington', 'data_updated_at' => base_time - 1.day},
          {'value' => 'California', 'data_updated_at' => base_time},
        ]
      }
    }
    users_input = {
      'dashboard.users' => {
        'state' => [
          {'value' => 'Texas', 'data_updated_at' => base_time - 1.day},
          {'value' => 'Florida', 'data_updated_at' => base_time},
        ]
      }
    }
    schools_input = {
      'dashboard.schools' => {
        'state' => [
          {'value' => 'IL', 'data_updated_at' => base_time},
          {'value' => 'PA', 'data_updated_at' => base_time - 1.day},
        ]
      }
    }

    tests = [
      {
        input: {}, expected_output: {}
      },
      # data come from the same table, the most recent value wins
      {
        input: form_geos_input,
        expected_output: {state: 'California'}
      },
      {
        input: users_input,
        expected_output: {state: 'Florida'}
      },
      {
        input: schools_input,
        expected_output: {state: 'Illinois'}
      },
      # users data has higher priority than form_geos data
      {
        input: form_geos_input.merge(users_input),
        expected_output: {state: 'Florida'}
      },
      # schools data has higher priority than users data
      {
        input: form_geos_input.merge(users_input).merge(schools_input),
        expected_output: {state: 'Illinois'}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_state test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_postal_code' do
    base_time = Time.now.utc
    form_geos_input = {
      'pegasus.form_geos' => {
        'postal_code' => [
          {'value' => '62702', 'data_updated_at' => base_time - 1.day},
          {'value' => '90249', 'data_updated_at' => base_time},
        ]
      }
    }
    users_input = {
      'dashboard.users' => {
        'postal_code' => [
          {'value' => '10118', 'data_updated_at' => base_time - 1.day},
          {'value' => 'EC4N', 'data_updated_at' => base_time},
        ]
      }
    }
    schools_input = {
      'dashboard.schools' => {
        'zip' => [
          {'value' => '00-493', 'data_updated_at' => base_time},
          {'value' => 'EC2P', 'data_updated_at' => base_time - 1.day},
        ]
      }
    }

    tests = [
      {
        input: {}, expected_output: {}
      },
      # data come from the same table, the most recent value wins
      {
        input: form_geos_input,
        expected_output: {postal_code: '90249'}
      },
      {
        input: users_input,
        expected_output: {postal_code: 'EC4N'}
      },
      {
        input: schools_input,
        expected_output: {postal_code: '00-493'}
      },
      # users data has higher priority than form_geos data
      {
        input: form_geos_input.merge(users_input),
        expected_output: {postal_code: 'EC4N'}
      },
      # schools data has higher priority than users data
      {
        input: form_geos_input.merge(users_input).merge(schools_input),
        expected_output: {postal_code: '00-493'}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_postal_code test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_city' do
    base_time = Time.now.utc
    form_geos_input = {
      'pegasus.form_geos' => {
        'city' => [
          {'value' => 'London', 'data_updated_at' => base_time - 1.day},
          {'value' => 'Seattle', 'data_updated_at' => base_time},
        ]
      }
    }
    users_input = {
      'dashboard.users' => {
        'city' => [
          {'value' => 'Vancouver', 'data_updated_at' => base_time - 1.day},
          {'value' => 'Turin', 'data_updated_at' => base_time},
        ]
      }
    }
    schools_input = {
      'dashboard.schools' => {
        'city' => [
          {'value' => 'Paris', 'data_updated_at' => base_time},
          {'value' => 'Berlin', 'data_updated_at' => base_time - 1.day},
        ]
      }
    }

    tests = [
      {
        input: {}, expected_output: {}
      },
      # data come from the same table, the most recent value wins
      {
        input: form_geos_input,
        expected_output: {city: 'Seattle'}
      },
      {
        input: users_input,
        expected_output: {city: 'Turin'}
      },
      {
        input: schools_input,
        expected_output: {city: 'Paris'}
      },
      # users data has higher priority than form_geos data
      {
        input: form_geos_input.merge(users_input),
        expected_output: {city: 'Turin'}
      },
      # schools data has higher priority than users data
      {
        input: form_geos_input.merge(users_input).merge(schools_input),
        expected_output: {city: 'Paris'}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_city test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_country' do
    base_time = Time.now.utc
    form_geos_input = {
      'pegasus.form_geos' => {
        'country' => [
          {'value' => 'Canada', 'data_updated_at' => base_time - 1.day},
          {'value' => 'United States', 'data_updated_at' => base_time},
        ]
      }
    }
    users_input = {
      'dashboard.users' => {
        'country' => [
          {'value' => 'United Kingdom', 'data_updated_at' => base_time - 1.day},
          {'value' => 'Italy', 'data_updated_at' => base_time},
        ]
      }
    }

    tests = [
      {
        input: {}, expected_output: {}
      },
      # data come from the same table, the most recent value wins
      {
        input: form_geos_input,
        expected_output: {country: 'United States'}
      },
      {
        input: users_input,
        expected_output: {country: 'Italy'}
      },
      # users data has higher priority than form_geos data
      {
        input: form_geos_input.merge(users_input),
        expected_output: {country: 'Italy'}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_country test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_hoc_organizer_years' do
    contact_data = {
      'pegasus.forms' => {
        'kind' => [
          # most common value type 'HocSignup<year>'
          {'value' => 'HocSignup2019'},
          # duplicate values
          {'value' => 'CSEdWeekEvent2013'},
          {'value' => 'CSEdWeekEvent2013'},
          # invalid values
          {'value' => nil},
          {'value' => 'HocSignup'},
          {'value' => 'HocCensus2017'}
        ]
      }
    }
    expected_output = {hoc_organizer_years: '2013,2019'}

    output = ContactRollupsProcessed.extract_hoc_organizer_years(contact_data)
    assert_equal expected_output, output
  end

  test 'extract_forms_submitted' do
    contact_data = {
      'pegasus.forms' => {
        'kind' => [
          {'value' => 'VolunteerContact2015'},
          # user can submit 2 forms of the same kind
          {'value' => 'Petition'},
          {'value' => 'Petition'},
          {'value' => nil},
        ]
      },
      'dashboard.census_submissions' => {}
    }
    expected_output = {forms_submitted: 'Census,Petition,VolunteerContact2015'}

    output = ContactRollupsProcessed.extract_forms_submitted contact_data
    assert_equal expected_output, output
  end

  test 'extract_form_roles' do
    contact_data = {
      'dashboard.census_submissions' => {
        'submitter_role' => [
          {'value' => Census::CensusSubmission::ROLES[:teacher]},
          {'value' => Census::CensusSubmission::ROLES[:parent]},
          {'value' => nil}
        ]
      },
      'pegasus.forms' => {
        'role' => [
          {'value' => 'Teacher'},
          {'value' => 'educator'},
          {'value' => 'not_valid_role'},
          {'value' => ''},
          {'value' => nil}
        ]
      }
    }
    expected_output = {form_roles: 'educator,parent,teacher'}

    output = ContactRollupsProcessed.extract_form_roles contact_data
    assert_equal expected_output, output
  end

  test 'extract_updated_at with valid input' do
    base_time = Time.now.utc - 7.days
    tests = [
      {
        input: {'table1' => {'last_data_updated_at' => base_time}},
        expected_output: {updated_at: base_time}
      },
      {
        input: {
          'table1' => {'last_data_updated_at' => base_time - 1.day},
          'table2' => {'last_data_updated_at' => base_time + 1.day},
          'table3' => {'last_data_updated_at' => base_time},
        },
        expected_output: {updated_at: base_time + 1.day}
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.extract_updated_at(test[:input])
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'extract_updated_at with invalid input' do
    assert_raise StandardError do
      ContactRollupsProcessed.extract_updated_at({'table' => {}})
    end
  end

  test 'parse_contact_data parses valid input' do
    # TODO: (ha) break this long test into smaller ones
    time_str = '2020-03-11 15:01:26'
    time_parsed = Time.find_zone('UTC').parse(time_str)
    time_str_2 = '2020-06-22 16:26:00'
    time_parsed_2 = Time.find_zone('UTC').parse(time_str_2)
    format_values = {
      sources_key: ContactRollupsProcessed::SOURCES_KEY,
      data_key: ContactRollupsProcessed::DATA_KEY,
      data_updated_at_key: ContactRollupsProcessed::DATA_UPDATED_AT_KEY,
      time_str: time_str,
      time_str_2: time_str_2
    }

    # Test inputs are JSON strings.
    # Use string +format+ method so we don't have to escape every double quotes.
    # Example of a JSON string test: "[{\"s\": \"table1\", \"d\": null, \"u\": \"2020-03-11 15:01:26\"}]"
    tests = [
      {
        # input data is null
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": null, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'last_data_updated_at' => time_parsed}}
      },
      # input data is an empty hash
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {'table1' => {'last_data_updated_at' => time_parsed}}
      },
      # input data has a valid key but its value is null
      {
        input: format(
          '[{"%{sources_key}": "table2", "%{data_key}": {"state": null}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table2' => {
            'state' => ['value' => nil, 'data_updated_at' => time_parsed],
            'last_data_updated_at' => time_parsed
          }
        }
      },
      # input data has valid key and value
      {
        input: format(
          '[{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table1' => {
            'opt_in' => [{'value' => 1, 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          }
        }
      },
      # input data has more than one value for a key and each value came in a different date
      {
        input: format(
          '['\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "WA"}, "%{data_updated_at_key}": "%{time_str}"},'\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "OR"}, "%{data_updated_at_key}": "%{time_str_2}"}'\
          ']',
          format_values
        ),
        expected_output: {
          'table2' => {
            'state' => [
              {'value' => 'WA', 'data_updated_at' => time_parsed},
              {'value' => 'OR', 'data_updated_at' => time_parsed_2}
            ],
            'last_data_updated_at' => time_parsed_2
          }
        }
      },
      # input data comes from 2 tables with different valid keys
      {
        input: format('['\
          '{"%{sources_key}": "table1", "%{data_key}": {"opt_in": 1}, "%{data_updated_at_key}": "%{time_str}"},'\
          '{"%{sources_key}": "table2", "%{data_key}": {"state": "WA"}, "%{data_updated_at_key}": "%{time_str}"}]',
          format_values
        ),
        expected_output: {
          'table1' => {
            'opt_in' => [{'value' => 1, 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          },
          'table2' => {
            'state' => [{'value' => 'WA', 'data_updated_at' => time_parsed}],
            'last_data_updated_at' => time_parsed
          }
        }
      }
    ]

    tests.each_with_index do |test, index|
      output = ContactRollupsProcessed.parse_contact_data test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  test 'parse_contact_data throws exception for invalid input' do
    test_inputs = [
      nil,
      '',
      '[{}]',
      '[{"sources": "table"}]',
      '[{"data_updated_at" => null}]',
      '[{"data_updated_at" => "invalid date"}]'
    ]

    test_inputs.each do |input|
      assert_raises do
        ContactRollupsProcessed.parse_contact_data input
      end
    end
  end
end
