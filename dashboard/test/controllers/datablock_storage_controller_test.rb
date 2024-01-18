require "test_helper"

class DatablockStorageControllerTest < ActionDispatch::IntegrationTest

  # 1) How do we make testing convenience functions, e.g. abstracting the URLs
  # 2) How do we create an applab project for testing with? Do we need to seed data?
 
  # factory :user_level do
  #   user {create :student}
  #   level {create :applab}
  # end

  setup do
    @student = create :student
    sign_in @student
    @level = create :applab
    user_storage_id = fake_storage_id_for_user_id(@student.id)
    channel_token = create :channel_token, level: @level, storage_id: user_storage_id
    @channel_id = channel_token.channel # calls storage_encrypt_channel_id(storage_id, project_id)
  end

  test "sets a string value" do
    post :set_key_value, params: {
      channel_id: @channel_id,
      key: 'key',
      value: 'val'
    }
    assert_response :success
    get :get_key_value, params: {
      channel_id: @channel_id,
      key: 'key'
    }
    assert_response :success
    val = JSON.parse(@response.body)
    assert_equal 'val', val

    # expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    # assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "get a string value" do

  end

  # setup_all do
  #   @teacher = create(:teacher)
  #   @teacher_other = create(:teacher)
  #   @section_owner = create(:teacher)
  #   #...etc...
  # end
  
  def snippets
    level_source1a = create :level_source, level: level1, data: 'Here is the answer 1a'
  end

  test 'loads applab if you are a teacher viewing your student and they have a channel id' do
    sign_in @teacher
    fake_last_attempt = 'STUDENT_LAST_ATTEMPT_SOURCE'
    user_storage_id = fake_storage_id_for_user_id(@student.id)
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :applab
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    create(:user_level,
      user: @student,
      script: script_level.script,
      level: script_level.level,
      level_source: create(:level_source, data: fake_last_attempt)
    )
    create :channel_token, level: level, storage_id: user_storage_id
    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }
    assert_select '#codeApp'
    assert_select '#notStarted', 0
    assert_includes response.body, fake_last_attempt
  end
  



  #   FirebaseStorage.setKeyValue('key', 'val', verifyStringValue, error =>
  #     console.warn(error)
  #   );

  #   function verifyStringValue() {
  #     getProjectDatabase()
  #       .child(`storage/keys`)
  #       .once('value')
  #       .then(snapshot => {
  #         expect(snapshot.val()).to.deep.equal({key: '"val"'});
  #         done();
  #       });
  #   }
  # });

  test "sets a number value" do

  end
    # FirebaseStorage.setKeyValue('key', 7, verifyNumberValue, error =>
    #   console.warn(error)
    # );

    # function verifyNumberValue() {
    #   getProjectDatabase()
    #     .child(`storage/keys`)
    #     .once('value')
    #     .then(snapshot => {
    #       expect(snapshot.val()).to.deep.equal({key: '7'});
    #       done();
    #     });
    # }

  test "sets and gets an undefined value" do
  end
  #   FirebaseStorage.setKeyValue('key', undefined, verifySetKeyValue, error =>
  #     console.warn(error)
  #   );

  #   function verifySetKeyValue() {
  #     getProjectDatabase()
  #       .child(`storage/keys`)
  #       .once('value')
  #       .then(snapshot => {
  #         expect(snapshot.val()).to.equal(null);
  #         FirebaseStorage.getKeyValue('key', verifyGetKeyValue, error =>
  #           console.warn(error)
  #         );
  #       });
  #   }

  #   function verifyGetKeyValue(actualValue) {
  #     expect(actualValue).to.equal(undefined);
  #     done();
  #   }
  # });

  test "fails on key names with ascii control codes" do
  end
  #   FirebaseStorage.setKeyValue(
  #     'key\n',
  #     'val',
  #     () => {
  #       throw 'unexpectedly allowed key name with ascii control code';
  #     },
  #     error => {
  #       expect(error.type).to.equal(WarningType.KEY_INVALID);
  #       verifyNoKeys();
  #     }
  #   );

  #   function verifyNoKeys() {
  #     getProjectDatabase()
  #       .child(`storage/keys`)
  #       .once('value')
  #       .then(snapshot => {
  #         expect(snapshot.val()).to.equal(null);
  #         done();
  #       });
  #   }
  # });

  test "warns and succeeds on key names with illegal characters" do
  end
    # let didWarn = false;
    # FirebaseStorage.setKeyValue(
    #   'foo/bar',
    #   'baz',
    #   () => verifyValueAndWarning(),
    #   error => {
    #     expect(error.type).to.equal(WarningType.KEY_RENAMED);
    #     didWarn = true;
    #   }
    # );

    # function verifyValueAndWarning() {
    #   expect(didWarn).to.be.true;
    #   getProjectDatabase()
    #     .child(`storage/keys`)
    #     .once('value')
    #     .then(snapshot => {
    #       expect(snapshot.val()).to.deep.equal({'foo-bar': '"baz"'});
    #       done();
    #     });
    # }

  test "escapes periods in the key" do
  end
#     FirebaseStorage.setKeyValue(
#       'foo.bar',
#       'baz',
#       () => verifyValue(),
#       err => console.warn(err)
#     );
#     function verifyValue() {
#       getProjectDatabase()
#         .child(`storage/keys`)
#         .once('value')
#         .then(snapshot => {
#           expect(snapshot.val()).to.deep.equal({'foo%2Ebar': '"baz"'});
#           done();
#         });
#     }
#   });
# });

  # describe('getKeyValue', () => {
  test "warns and succeeds on keys with invalid characters" do

  end
  #   it('warns and succeeds on keys with invalid characters', done => {
  #     let didWarn = false;
  #     FirebaseStorage.setKeyValue('key/slash', 'value7', getKeyValue, () => {});

  #     function getKeyValue() {
  #       FirebaseStorage.getKeyValue('key/slash', verifyGetKeyValue, error => {
  #         expect(error.type).to.equal(WarningType.KEY_RENAMED);
  #         didWarn = true;
  #       });
  #     }

  #     function verifyGetKeyValue(actualValue) {
  #       expect(didWarn).to.be.true;
  #       expect(actualValue).to.equal('value7');
  #       done();
  #     }
  #   });
  # });
end
