require 'active_support'
require 'active_record'
require 'active_record/connection_adapters/mysql2_adapter'
require 'sequel'
require 'yaml'
require 'erb'

# Patch Mysql2Adapter to only create the specified tables.
module SchemaTableFilter
  FAKE_TABLES = %w(
    users
    user_permissions
    courses
    scripts
    course_scripts
    experiments
    sections
    followers
    secret_words
  ) + [
    ActiveRecord::Base.schema_migrations_table_name,
    ActiveRecord::Base.internal_metadata_table_name,
  ]

  def create_table(name, options)
    if FAKE_TABLES.include?(name)
      super(name, options)
    end
  end
end

ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend SchemaTableFilter

# Patch Mysql2Adapter to create temporary tables instead of persistent ones.
module TempTableFilter
  def create_table(name, options)
    super(name, options.merge(temporary: true))
  end

  # Temporary tables may shadow persistent tables we don't want to drop.
  def data_source_exists?(_)
    false
  end

  # Temporary tables don't support foreign key indexes, so ignore them.
  def add_foreign_key(*_)
  end
end
ActiveRecord::ConnectionAdapters::Mysql2Adapter.prepend TempTableFilter

#
# Provides a fake Dashboard database with some fake data to test against.
#
module FakeDashboard
  # TODO(asher): Many of the CONSTANTS in this module are not constants, being mutated later. Fix
  # this.

  @@fake_db = nil

  #
  # Fake Data: Users
  #
  UNUSED_USER_ID = 12345
  STUDENT = {id: 1, name: 'Sally Student', user_type: 'student'}
  STUDENT_SELF = {id: 2, name: 'Self Studying Student', user_type: 'student'}
  STUDENT_DELETED = {
    id: 3, name: 'Stricken Student', user_type: 'student', deleted_at: '2016-01-01 12:34:56'
  }
  STUDENT_DELETED_FOLLOWER = {id: 4, name: 'S4 Student', user_type: 'student'}
  STUDENT_DELETED_SECTION = {id: 5, name: 'S5 Student', user_type: 'student'}
  TEACHER = {id: 6, name: 'Terry Teacher', user_type: 'teacher'}
  TEACHER_SELF = {id: 7, name: 'Troglodyte Teacher', user_type: 'teacher'}
  TEACHER_DELETED_SECTION = {id: 8, name: 'Temporary Teacher', user_type: 'teacher'}
  TEACHER_DELETED_FOLLOWER = {id: 9, name: 'Transient Teacher', user_type: 'teacher'}
  TEACHER_DELETED_USER = {id: 10, name: 'T Teacher', user_type: 'teacher'}
  ADMIN = {id: 11, name: 'Alice Admin', user_type: 'teacher', admin: true}
  FACILITATOR = {id: 12, name: 'Fran Facilitator', user_type: 'teacher'}
  USERS = [
    STUDENT,
    STUDENT_SELF,
    STUDENT_DELETED,
    STUDENT_DELETED_FOLLOWER,
    STUDENT_DELETED_SECTION,
    TEACHER,
    TEACHER_SELF,
    TEACHER_DELETED_SECTION,
    TEACHER_DELETED_FOLLOWER,
    TEACHER_DELETED_USER,
    ADMIN,
    FACILITATOR
  ]

  #
  # Fake Data; User Permissions
  #
  USER_PERMISSIONS = [
    {user_id: FACILITATOR[:id], permission: 'facilitator'}
  ]

  #
  # Fake Data: Courses
  #
  COURSES = [
    COURSE_CSP = {
      id: 15,
      name: 'csp',
      created_at: '2016-01-01 00:01:02',
      updated_at: '2016-01-01 00:01:02'
    }
  ]

  #
  # Fake Data: Scripts
  #
  SCRIPTS = [
    SCRIPT_FOO = {
      id: 1,
      name: 'Foo',
      hidden: 0
    },
    SCRIPT_BAR = {
      id: 3,
      name: 'Bar',
      hidden: 0
    },
    SCRIPT_MC = {
      id: 4,
      name: 'mc',
      hidden: 0
    },
    SCRIPT_HOUROFCODE = {
      id: 5,
      name: 'hourofcode',
      hidden: 0
    },
    SCRIPT_MINECRAFT = {
      id: 6,
      name: 'minecraft',
      hidden: 0
    },
    SCRIPT_FLAPPY = {
      id: 10,
      name: 'flappy',
      hidden: 0
    },
    SCRIPT_CSP1 = {
      id: 31,
      name: 'csp1',
      hidden: 0,
    },
    SCRIPT_CSP2 = {
      id: 32,
      name: 'csp2',
      hidden: 0,
    },
    SCRIPT_CSP3 = {
      id: 34,
      name: 'csp3',
      hidden: 0,
    },
    # put the hidden scripts at the end and give them higher ids, to make
    # unit testing slightly easier.
    SCRIPT_ALLTHETHINGS = {
      id: 45,
      name: 'allthehiddenthings',
      hidden: 1
    },
    SCRIPT_CSP2_ALT = {
      id: 53,
      name: 'csp2-alt',
      hidden: 1
    },
  ]

  COURSE_SCRIPTS = [
    {
      course_id: COURSE_CSP[:id],
      script_id: SCRIPT_CSP1[:id],
      position: 1
    },
    {
      course_id: COURSE_CSP[:id],
      script_id: SCRIPT_CSP2[:id],
      position: 2
    },
    {
      course_id: COURSE_CSP[:id],
      script_id: SCRIPT_CSP2_ALT[:id],
      position: 2,
      experiment_name: 'csp2-alt-experiment',
      default_script_id: SCRIPT_CSP2[:id]
    },
    {
      course_id: COURSE_CSP[:id],
      script_id: SCRIPT_CSP3[:id],
      position: 3
    },
  ]

  EXPERIMENTS = [
    CSP2_ALT_EXPERIMENT = {
      name: 'csp2-alt-experiment',
      type: 'SingleUserExperiment',
      min_user_id: 17
    }
  ]

  #
  # Fake Data: Sections
  #
  SECTION_NORMAL = {id: 150001, user_id: TEACHER[:id], name: 'Fake Section A'}
  SECTION_EMPTY = {id: 150002, user_id: TEACHER[:id], name: 'Fake Section B'}
  SECTION_DELETED = {
    id: 150003, user_id: TEACHER_DELETED_SECTION[:id], name: 'Fake Section C',
    deleted_at: '2015-01-01 12:34:56'
  }
  SECTION_DELETED_FOLLOWER = {
    id: 150004, user_id: TEACHER_DELETED_FOLLOWER[:id], name: 'Fake Section D'
  }
  SECTION_DELETED_USER = {
    id: 150005, user_id: TEACHER_DELETED_USER[:id], name: 'Fake Section E'
  }
  # Section assigned to an arbitrary (made-up) course
  SECTION_COURSE = {
    id: 150006, user_id: TEACHER[:id], name: 'Fake Section assigned course', course_id: COURSES[0][:id]
  }
  TEACHER_SECTIONS = [
    SECTION_NORMAL,
    SECTION_EMPTY,
    SECTION_DELETED,
    SECTION_DELETED_FOLLOWER,
    SECTION_DELETED_USER,
    SECTION_COURSE
  ]

  #
  # Fake Data: Followers
  #
  FOLLOWERS = [
    {
      section_id: SECTION_NORMAL[:id],
      student_user_id: STUDENT[:id]
    },
    {
      section_id: SECTION_DELETED[:id],
      student_user_id: STUDENT_DELETED_SECTION[:id]
    },
    {
      section_id: SECTION_DELETED_FOLLOWER[:id],
      student_user_id: STUDENT_DELETED_FOLLOWER[:id],
      deleted_at: '2016-01-01 00:01:02'
    },
    {
      section_id: SECTION_DELETED_USER[:id],
      student_user_id: STUDENT_DELETED[:id]
    }
  ]

  #
  # Fake Data: Secret Words
  #
  SECRET_WORDS = [{word: 'abracadabra'}]

  # Overrides the current database with a procedure that, given a query,
  # will return results appropriate to our test suite.
  #
  # If you will be modifying the database in your test, you should isolate your
  # test with a transaction so the changes do not affect other tests (unfortuantely
  # we cannot make this automatic yet):
  #
  #   Dashboard.db.transaction(:rollback => :always) do
  #     ...test stuff here...
  #   end
  #
  # @returns [Sequel::Database] fake database handle
  def self.use_fake_database
    create_fake_dashboard_db if @@fake_db.nil?
    Dashboard.stubs(:db).returns(@@fake_db)
    @@fake_db
  end

  def self.stub_database
    Dashboard.stubs(:db)
  end

  # Lazy-creates temporary-tables using Dashboard's real ActiveRecord schema,
  # and populates them with some simple test data.
  # We might want to extract the test data to individual tests in the future,
  # or provide an explicit way to request certain test-data setups.
  def self.create_fake_dashboard_db
    database = YAML.load(ERB.new(File.new(dashboard_dir('config/database.yml')).read).result) || {}
    # Temporary tables aren't shared across multiple database connections.
    database['test']['pool'] = 1

    ActiveRecord::Base.configurations = database
    ActiveRecord::Base.establish_connection
    ActiveRecord::Schema.verbose = false
    ActiveRecord::Base.transaction do
      require_relative('../../../dashboard/db/schema')
    end

    # Reuse the same connection in Sequel to share access to the temporary tables.
    connection = ActiveRecord::Base.connection.instance_variable_get(:@connection)
    connection.query_options[:as] = :hash
    Sequel.extension :meta_def
    @@fake_db = Sequel.mysql2
    @@fake_db.meta_def(:connect){|_| connection}

    USERS.each do |user|
      new_id = @@fake_db[:users].insert(user)
      user.merge! @@fake_db[:users][id: new_id]
    end

    USER_PERMISSIONS.each do |perm|
      new_id = @@fake_db[:user_permissions].insert(perm)
      perm.merge! @@fake_db[:user_permissions][id: new_id]
    end

    COURSES.each do |course|
      new_id = @@fake_db[:courses].insert(course)
      course.merge! @@fake_db[:courses][id: new_id]
    end

    SCRIPTS.each do |script|
      new_id = @@fake_db[:scripts].insert(script)
      script.merge! @@fake_db[:scripts][id: new_id]
    end

    COURSE_SCRIPTS.each do |course_script|
      new_id = @@fake_db[:course_scripts].insert(course_script)
      course_script.merge! @@fake_db[:course_scripts][id: new_id]
    end

    EXPERIMENTS.each do |experiment|
      experiment[:created_at] ||= Time.now
      experiment[:updated_at] ||= Time.now
      new_id = @@fake_db[:experiments].insert(experiment)
      experiment.merge! @@fake_db[:experiments][id: new_id]
    end

    TEACHER_SECTIONS.each do |section|
      new_id = @@fake_db[:sections].insert(section)
      section.merge! @@fake_db[:sections][id: new_id]
    end

    FOLLOWERS.each do |follower|
      new_id = @@fake_db[:followers].insert(follower)
      follower.merge! @@fake_db[:followers][id: new_id]
    end

    SECRET_WORDS.each do |secret_word|
      @@fake_db[:secret_words].insert(secret_word)
    end
  end
end
