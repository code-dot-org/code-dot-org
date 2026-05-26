require_relative '../../../test_helper'
require_relative '../../../../cdo/aws/redshift/materialized_view_generator'
require 'erb'
require 'fileutils'
require 'tmpdir'

module Cdo
  module Aws
    module Redshift
      describe MaterializedViewGenerator do
        def mock_column(name, type)
          col = stub
          col.stubs(:name).returns(name)
          col.stubs(:type).returns(type)
          col
        end

        let(:id_col)         {mock_column('id', :integer)}
        let(:name_col)       {mock_column('name', :string)}
        let(:email_col)      {mock_column('email', :string)}
        let(:bio_col)        {mock_column('bio', :text)}
        let(:age_col)        {mock_column('age', :integer)}
        let(:is_admin_col)   {mock_column('is_admin', :boolean)}
        let(:score_col)      {mock_column('score', :float)}
        let(:created_at_col) {mock_column('created_at', :datetime)}
        let(:updated_at_col) {mock_column('updated_at', :datetime)}
        let(:deleted_at_col) {mock_column('deleted_at', :datetime)}
        let(:last_login_col) {mock_column('last_login', :datetime)}
        let(:birthday_col)   {mock_column('birthday', :date)}

        let(:all_columns) {[id_col, name_col, email_col, bio_col, age_col, is_admin_col, score_col, created_at_col, updated_at_col, deleted_at_col, last_login_col, birthday_col]}

        let(:model) {stub}

        before do
          model.stubs(:table_name).returns('users')
          model.stubs(:primary_key).returns('id')
          model.stubs(:columns).returns(all_columns)
        end

        describe '#generate_pii_ddl' do
          it 'includes all columns in the SELECT clause' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            all_columns.each {|col| assert_includes ddl, col.name}
          end

          it 'uses ERB template variable in the pii schema name' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'dashboard_<%=environment_type%>_pii.zeroetl_users'
          end

          it 'uses ERB template variables in the source table path' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, '<%=environment_type%>_learningplatform_mysql_zeroetl.dashboard_<%=environment_type%>.users'
          end

          it 'uses the primary key as the distkey (double-quoted)' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTSTYLE KEY DISTKEY ("id")'
          end

          it 'disables backup and automated refresh' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'BACKUP NO'
            assert_includes ddl, 'AUTO REFRESH NO'
          end

          it 'returns nil when the model has no columns' do
            model.stubs(:columns).returns([])
            assert_nil MaterializedViewGenerator.new(model).generate_pii_ddl
          end

          it 'renders to the correct production schema when ERB is evaluated' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            environment_type = 'production'
            rendered = ERB.new(ddl).result(binding)
            assert_includes rendered, 'dashboard_production_pii.zeroetl_users'
            assert_includes rendered, 'production_learningplatform_mysql_zeroetl.dashboard_production.users'
          end
        end

        describe '#generate_non_pii_ddl' do
          let(:generator) {MaterializedViewGenerator.new(model)}

          it 'excludes string columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'name'
            refute_includes ddl, 'email'
          end

          it 'excludes text columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'bio'
          end

          it 'excludes non-allowlisted datetime columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'last_login'
          end

          it 'excludes non-allowlisted date columns' do
            ddl = generator.generate_non_pii_ddl
            refute_includes ddl, 'birthday'
          end

          it 'includes allowlisted datetime columns (created_at, updated_at, deleted_at)' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'created_at'
            assert_includes ddl, 'updated_at'
            assert_includes ddl, 'deleted_at'
          end

          it 'includes non-text, non-date columns (integer, boolean, float)' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'id'
            assert_includes ddl, 'age'
            assert_includes ddl, 'is_admin'
            assert_includes ddl, 'score'
          end

          it 'uses ERB template variable in the non-pii schema name' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'dashboard_<%=environment_type%>.zeroetl_users'
            refute_includes ddl, '_pii'
          end

          it 'disables backup and automated refresh' do
            ddl = generator.generate_non_pii_ddl
            assert_includes ddl, 'BACKUP NO'
            assert_includes ddl, 'AUTO REFRESH NO'
          end

          it 'returns nil when there are no non-pii columns' do
            model.stubs(:columns).returns([name_col, bio_col])
            assert_nil generator.generate_non_pii_ddl
          end
        end

        describe '#save_ddl_templates' do
          let(:generator) {MaterializedViewGenerator.new(model)}
          let(:tmpdir) {Dir.mktmpdir}

          before do
            MaterializedViewGenerator.send(:remove_const, :SQL_VIEW_TEMPLATE_DIR)
            MaterializedViewGenerator.const_set(:SQL_VIEW_TEMPLATE_DIR, tmpdir)
          end

          after do
            FileUtils.remove_entry(tmpdir)
          end

          it 'writes pii and non-pii template files' do
            files = generator.save_ddl_templates
            assert_equal 2, files.length
            assert(files.any? {|f| f.end_with?('users_pii.sql.erb')})
            assert(files.any? {|f| f.end_with?('users.sql.erb')})
            files.each {|f| assert File.exist?(f)}
          end

          it 'writes valid ERB templates that render correctly' do
            generator.save_ddl_templates
            pii_path = File.join(tmpdir, 'users_pii.sql.erb')
            rendered = MaterializedViewGenerator.render_ddl(pii_path, environment_type: 'production')
            assert_includes rendered, 'dashboard_production_pii.zeroetl_users'
            assert_includes rendered, 'production_learningplatform_mysql_zeroetl.dashboard_production.users'
          end

          it 'skips pii file when model has no columns' do
            model.stubs(:columns).returns([])
            files = generator.save_ddl_templates
            assert_empty files
          end

          it 'skips non-pii file when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            files = generator.save_ddl_templates
            # The PII view still contains the (text) columns, so its file is written.
            # Only the non-PII view, which would have been empty, is skipped.
            assert_equal 1, files.length
            assert(files.any? {|f| f.end_with?('users_pii.sql.erb')})
            refute(files.any? {|f| File.basename(f) == 'users.sql.erb'})
          end
        end

        describe '.render_ddl' do
          let(:tmpdir) {Dir.mktmpdir}

          after do
            FileUtils.remove_entry(tmpdir)
          end

          it 'renders environment_type into the template' do
            template_path = File.join(tmpdir, 'test_template.sql.erb')
            File.write(template_path, 'SELECT * FROM <%=environment_type%>_db.table;')
            result = MaterializedViewGenerator.render_ddl(template_path, environment_type: 'production')
            assert_equal 'SELECT * FROM production_db.table;', result
          end

          it 'accepts symbol environment_type' do
            template_path = File.join(tmpdir, 'test_template.sql.erb')
            File.write(template_path, 'SELECT * FROM <%=environment_type%>_db.table;')
            result = MaterializedViewGenerator.render_ddl(template_path, environment_type: :test)
            assert_equal 'SELECT * FROM test_db.table;', result
          end
        end

        describe '#create_or_replace_views' do
          let(:generator) {MaterializedViewGenerator.new(model)}
          let(:client) {mock('redshift_client')}
          let(:tmpdir) {Dir.mktmpdir}

          before do
            MaterializedViewGenerator.send(:remove_const, :SQL_VIEW_TEMPLATE_DIR)
            MaterializedViewGenerator.const_set(:SQL_VIEW_TEMPLATE_DIR, tmpdir)
          end

          after do
            FileUtils.remove_entry(tmpdir)
          end

          it 'submits each view batch via batch_execute_async and returns statement IDs by FQN' do
            client.stubs(:batch_execute_async).returns('id-pii').then.returns('id-non-pii')

            result = generator.create_or_replace_views(client: client, environment_type: :production)

            assert_equal(
              {
                'dashboard_production_pii.zeroetl_users' => 'id-pii',
                'dashboard_production.zeroetl_users' => 'id-non-pii'
              },
              result
            )
          end

          it 'returns empty hash when model has no columns' do
            model.stubs(:columns).returns([])
            client.expects(:batch_execute_async).never
            assert_empty generator.create_or_replace_views(client: client, environment_type: :test)
          end

          it 'each batch is [DROP, CREATE, COMMENT ON COLUMN ... IS hash-of-create]' do
            batches = []
            client.stubs(:batch_execute_async).with do |sqls|
              batches << sqls
              "id-#{batches.length}"
            end

            generator.create_or_replace_views(client: client, environment_type: :production)

            assert_equal 2, batches.length
            batches.each do |sqls|
              assert_equal 3, sqls.length
              assert sqls[0].start_with?('DROP MATERIALIZED VIEW IF EXISTS ')
              assert sqls[1].start_with?('CREATE MATERIALIZED VIEW ')
              expected_hash = Digest::SHA256.hexdigest(sqls[1])
              assert_match(/\ACOMMENT ON COLUMN \S+\.id IS '#{expected_hash}'\z/, sqls[2])
            end
          end

          it 'saves ERB template files to the template directory' do
            client.stubs(:batch_execute_async).returns('id')
            generator.create_or_replace_views(client: client, environment_type: :test)

            assert File.exist?(File.join(tmpdir, 'users_pii.sql.erb'))
            assert File.exist?(File.join(tmpdir, 'users.sql.erb'))
          end

          it 'renders ERB placeholders in the CREATE SQL' do
            batches = []
            client.stubs(:batch_execute_async).with {|sqls| batches << sqls; 'id'}

            generator.create_or_replace_views(client: client, environment_type: :test)

            batches.each do |sqls|
              assert_includes sqls[1], 'test_learningplatform_mysql_zeroetl.dashboard_test.users'
              refute_includes sqls[1], '<%='
            end
          end

          it 'skips non-pii view when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            batches = []
            client.stubs(:batch_execute_async).with {|sqls| batches << sqls; 'id'}

            result = generator.create_or_replace_views(client: client, environment_type: :production)

            assert_equal 1, batches.length
            assert_equal 'DROP MATERIALIZED VIEW IF EXISTS dashboard_production_pii.zeroetl_users', batches[0][0]
            assert_includes batches[0][1], 'CREATE MATERIALIZED VIEW dashboard_production_pii.zeroetl_users'
            assert_equal ['dashboard_production_pii.zeroetl_users'], result.keys
          end
        end

        describe '.view_status' do
          let(:client) {mock('redshift_client')}

          before do
            # view_status calls list_view_staleness via client.execute(...SVV_MV_INFO...).
            # Default to "no staleness rows" — individual tests override when they
            # exercise the SVV_MV_INFO integration.
            client.stubs(:execute).returns([])
          end

          # Builds a stub matching the Aws::PageableResponse contract:
          # only `each_page` is called by `view_status`.
          def pageable(statements)
            page = stub('page', statements: statements)
            pageable = stub('pageable')
            pageable.stubs(:each_page).yields(page)
            pageable
          end

          def list_stmt(id:, query_string:, created_at: Time.now, status: 'FINISHED')
            stub('list_stmt', id: id, query_string: query_string, created_at: created_at, status: status)
          end

          def describe(sub_query_strings:, db_user: 'dev', duration: 0)
            subs = sub_query_strings.map {|qs| stub('sub', query_string: qs)}
            stub('desc',
              sub_statements: subs,
              db_user: db_user,
              query_string: sub_query_strings.first,
              duration: duration
            )
          end

          # Stubs `describe_statement` for a single-statement (non-batch)
          # submission — Redshift sets sub_statements=nil for these, and
          # `query_string` carries the only SQL.
          def describe_single(query_string:, db_user: 'dev', duration: 0)
            stub('desc',
              sub_statements: nil,
              db_user: db_user,
              query_string: query_string,
              duration: duration
            )
          end

          it 'returns a CREATE row for each PII and non-PII view in the most recent batch' do
            batch_pii = list_stmt(id: 'pii-1',
              query_string: "DROP MATERIALIZED VIEW IF EXISTS dashboard_test_pii.zeroetl_usersCREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users"
)
            batch_non_pii = list_stmt(id: 'non-pii-1',
              query_string: "DROP MATERIALIZED VIEW IF EXISTS dashboard_test.zeroetl_usersCREATE MATERIALIZED VIEW dashboard_test.zeroetl_users"
)

            client.stubs(:list_statements).returns(pageable([batch_pii, batch_non_pii]))
            client.stubs(:describe_statement).with('pii-1').returns(describe(sub_query_strings: [
                                                                               'DROP MATERIALIZED VIEW IF EXISTS dashboard_test_pii.zeroetl_users',
                                                                               'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users AS SELECT id FROM x;',
                                                                               "COMMENT ON COLUMN dashboard_test_pii.zeroetl_users.id IS 'abc'"
                                                                             ]
)
)
            client.stubs(:describe_statement).with('non-pii-1').returns(describe(sub_query_strings: [
                                                                                   'DROP MATERIALIZED VIEW IF EXISTS dashboard_test.zeroetl_users',
                                                                                   'CREATE MATERIALIZED VIEW dashboard_test.zeroetl_users AS SELECT id FROM x;',
                                                                                   "COMMENT ON COLUMN dashboard_test.zeroetl_users.id IS 'def'"
                                                                                 ]
)
)

            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            assert_equal 2, rows.length
            non_pii_row = rows.find {|r| r.view_type == 'non_pii'}
            pii_row = rows.find {|r| r.view_type == 'pii'}
            assert_equal 'CREATE', pii_row.operation
            assert_equal 'CREATE', non_pii_row.operation
            assert_equal 'pii-1', pii_row.statement_id
            assert_equal 'non-pii-1', non_pii_row.statement_id
            assert_equal 'User', pii_row.model_name
            assert_equal 'users', pii_row.table_name
            assert_equal 'dev', pii_row.db_user
          end

          it 'CREATE wins over DROP within the same batch (DROP+CREATE+COMMENT)' do
            batch = list_stmt(id: 'b1',
              query_string: 'DROP MATERIALIZED VIEW IF EXISTS dashboard_test_pii.zeroetl_users CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users'
)
            client.stubs(:list_statements).returns(pageable([batch]))
            client.stubs(:describe_statement).with('b1').returns(describe(sub_query_strings: [
                                                                            'DROP MATERIALIZED VIEW IF EXISTS dashboard_test_pii.zeroetl_users',
                                                                            'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users AS SELECT id FROM x;'
                                                                          ]
)
)
            model.stubs(:name).returns('User')
            model.stubs(:columns).returns([name_col]) # PII-only model

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            row = rows.first
            assert_equal 'CREATE', row.operation
          end

          it 'reports the consolidated orphan-drop batch per FQN' do
            orphan_pii = 'dashboard_test_pii.zeroetl_old'
            orphan_non_pii = 'dashboard_test.zeroetl_old'
            batch = list_stmt(id: 'drop-batch',
              query_string: "DROP MATERIALIZED VIEW IF EXISTS #{orphan_pii} DROP MATERIALIZED VIEW IF EXISTS #{orphan_non_pii}"
)
            client.stubs(:list_statements).returns(pageable([batch]))
            client.stubs(:describe_statement).with('drop-batch').returns(describe(sub_query_strings: [
                                                                                    "DROP MATERIALIZED VIEW IF EXISTS #{orphan_pii}",
                                                                                    "DROP MATERIALIZED VIEW IF EXISTS #{orphan_non_pii}"
                                                                                  ]
)
)

            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            orphan_rows = rows.select {|r| r.model_name == '(orphan)'}
            assert_equal 2, orphan_rows.length
            orphan_rows.each do |r|
              assert_equal 'DROP', r.operation
              assert_equal 'old', r.table_name
              assert_equal 'drop-batch', r.statement_id
            end
          end

          it 'emits a "(no recent)" row for expected views with no matching statement' do
            client.stubs(:list_statements).returns(pageable([]))
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            assert_equal 2, rows.length
            rows.each do |r|
              assert_equal '(no recent)', r.status
              assert_nil r.operation
              assert_nil r.statement_id
              assert_nil r.executed_at
            end
          end

          it 'ignores statements that do not mention our zeroetl_ schema prefixes' do
            unrelated = list_stmt(id: 'unrelated', query_string: 'SELECT * FROM some_other_table')
            client.stubs(:list_statements).returns(pageable([unrelated]))
            client.expects(:describe_statement).never

            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            rows.each {|r| assert_equal '(no recent)', r.status}
          end

          it 'stops paginating once the cutoff is crossed' do
            recent = list_stmt(id: 'recent', created_at: Time.now,
              query_string: 'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users'
)
            old = list_stmt(id: 'old', created_at: 48.hours.ago,
              query_string: 'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users'
)

            client.stubs(:list_statements).returns(pageable([recent, old]))
            client.stubs(:describe_statement).with('recent').returns(describe(sub_query_strings: [
                                                                                'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users AS SELECT id FROM x;'
                                                                              ]
)
)
            client.expects(:describe_statement).with('old').never

            model.stubs(:name).returns('User')

            MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model], hours_back: 24
            )
          end

          it 'populates is_stale, state, and state_description from SVV_MV_INFO' do
            # Override the default empty execute stub: PII view is stale and
            # refreshes incrementally (state 1); non-PII view is fresh and
            # refreshes by full recompute (state 0).
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_users', 'is_stale' => 't', 'state' => 1},
                {'schema' => 'dashboard_test', 'name' => 'zeroetl_users', 'is_stale' => 'f', 'state' => 0}
              ]
            )
            client.stubs(:list_statements).returns(pageable([]))
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            pii_row = rows.find {|r| r.view_type == 'pii'}
            non_pii_row = rows.find {|r| r.view_type == 'non_pii'}
            assert_equal true, pii_row.is_stale
            assert_equal 1, pii_row.state
            assert_equal 'Refreshes incrementally', pii_row.state_description
            assert_equal false, non_pii_row.is_stale
            assert_equal 0, non_pii_row.state
            assert_equal 'Refreshes by full recompute', non_pii_row.state_description
          end

          it 'describes an unrefreshable view (state >= 100) in state_description' do
            client.stubs(:execute).returns(
              [{'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_users', 'is_stale' => 't', 'state' => 101}]
            )
            client.stubs(:list_statements).returns(pageable([]))
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            pii_row = rows.find {|r| r.view_type == 'pii'}
            assert_equal 101, pii_row.state
            assert_includes pii_row.state_description, "Can't refresh"
            assert_includes pii_row.state_description, 'rebuild required'
          end

          it 'converts describe_statement.duration from nanoseconds to Float seconds (nil when zero / in-progress)' do
            finished = list_stmt(id: 'f1', query_string: 'CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users')
            in_progress = list_stmt(id: 'p1', query_string: 'CREATE MATERIALIZED VIEW dashboard_test.zeroetl_users')

            client.stubs(:list_statements).returns(pageable([finished, in_progress]))
            client.stubs(:describe_statement).with('f1').returns(describe(
                                                                   sub_query_strings: ['CREATE MATERIALIZED VIEW dashboard_test_pii.zeroetl_users AS SELECT id FROM x;'],
                                                                   duration: 12_345_000_000 # 12.345 seconds in nanoseconds
            )
)
            client.stubs(:describe_statement).with('p1').returns(describe(
                                                                   sub_query_strings: ['CREATE MATERIALIZED VIEW dashboard_test.zeroetl_users AS SELECT id FROM x;'],
                                                                   duration: 0
            )
)
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            pii_row = rows.find {|r| r.view_type == 'pii'}
            non_pii_row = rows.find {|r| r.view_type == 'non_pii'}
            assert_in_delta 12.345, pii_row.duration_seconds, 0.001
            assert_nil non_pii_row.duration_seconds
          end

          it 'handles single-statement submissions (sub_statements=nil) by parsing query_string directly' do
            # REFRESH submitted via `execute_async` is a single, non-batch
            # statement; describe_statement reports sub_statements=nil with the
            # SQL in `query_string`. view_status must handle that without
            # blowing up.
            refresh_stmt = list_stmt(id: 'r1', query_string: 'REFRESH MATERIALIZED VIEW dashboard_test_pii.zeroetl_users')
            client.stubs(:list_statements).returns(pageable([refresh_stmt]))
            client.stubs(:describe_statement).with('r1').returns(
              describe_single(query_string: 'REFRESH MATERIALIZED VIEW dashboard_test_pii.zeroetl_users')
            )
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            pii_row = rows.find {|r| r.view_type == 'pii'}
            assert_equal 'REFRESH', pii_row.operation
            assert_equal 'r1', pii_row.statement_id
          end

          it 'leaves is_stale and state nil for views not present in SVV_MV_INFO' do
            # The default empty execute stub stays in effect.
            client.stubs(:list_statements).returns(pageable([]))
            model.stubs(:name).returns('User')

            rows = MaterializedViewGenerator.view_status(
              client: client, environment_type: :test, models: [model]
            )

            rows.each do |r|
              assert_nil r.is_stale
              assert_nil r.state
            end
          end
        end

        describe '#refresh_views' do
          let(:generator) {MaterializedViewGenerator.new(model)}
          let(:client) {mock('redshift_client')}

          it 'submits one async REFRESH per view and returns statement IDs by FQN' do
            calls = []
            client.stubs(:execute_async).with {|sql| calls << sql; true}.returns('id-1', 'id-2')

            result = generator.refresh_views(client: client, environment_type: :production)

            assert_equal(
              [
                'REFRESH MATERIALIZED VIEW dashboard_production_pii.zeroetl_users',
                'REFRESH MATERIALIZED VIEW dashboard_production.zeroetl_users'
              ],
              calls
            )
            assert_equal(
              {
                'dashboard_production_pii.zeroetl_users' => 'id-1',
                'dashboard_production.zeroetl_users' => 'id-2'
              },
              result
            )
          end

          it 'returns empty hash when model has no columns' do
            model.stubs(:columns).returns([])
            client.expects(:execute_async).never
            assert_empty generator.refresh_views(client: client, environment_type: :production)
          end

          it 'skips non-pii view when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            calls = []
            client.stubs(:execute_async).with {|sql| calls << sql; 'id'}

            result = generator.refresh_views(client: client, environment_type: :production)

            assert_equal ['REFRESH MATERIALIZED VIEW dashboard_production_pii.zeroetl_users'], calls
            assert_equal ['dashboard_production_pii.zeroetl_users'], result.keys
          end
        end

        describe '.refresh_all_views' do
          let(:client) {mock('redshift_client')}
          let(:activities_model) {stub}

          before do
            activities_model.stubs(:table_name).returns('activities')
            activities_model.stubs(:primary_key).returns('id')
            activities_model.stubs(:columns).returns([id_col, age_col, created_at_col])

            # `refresh_all_views` first calls `list_view_staleness` via
            # client.execute(...SVV_MV_INFO...). Default to no rows so every
            # view is treated as "unknown freshness" and therefore refreshed
            # (the safer default). Individual tests override to exercise skip
            # behavior.
            client.stubs(:execute).returns([])
          end

          it 'submits async REFRESH for every model and returns merged statement IDs' do
            client.stubs(:execute_async).returns('id-1', 'id-2', 'id-3', 'id-4')

            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model, activities_model]
            )

            # Two models, two views each → four statement IDs.
            assert_equal 4, result[:statements].length
            assert_includes result[:statements].keys, 'dashboard_production_pii.zeroetl_users'
            assert_includes result[:statements].keys, 'dashboard_production.zeroetl_users'
            assert_includes result[:statements].keys, 'dashboard_production_pii.zeroetl_activities'
            assert_includes result[:statements].keys, 'dashboard_production.zeroetl_activities'
            assert_empty result[:failed]
          end

          it 'skips models whose every view is not stale' do
            # SVV_MV_INFO says both of this model's views are fresh.
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'is_stale' => 'f', 'state' => 101},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'is_stale' => 'f', 'state' => 101}
              ]
            )
            client.expects(:execute_async).never

            events = []
            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model]
            ) {|event, payload, _| events << [event, payload]}

            assert_includes events, [:skipped, 'users']
            assert_empty result[:statements]
          end

          it 'refreshes only the stale views of a model with one stale and one fresh view' do
            # PII is stale, non-PII is fresh.
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'is_stale' => 't', 'state' => 100},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'is_stale' => 'f', 'state' => 101}
              ]
            )
            calls = []
            client.stubs(:execute_async).with {|sql| calls << sql; true}.returns('id-1')

            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_equal ['REFRESH MATERIALIZED VIEW dashboard_production_pii.zeroetl_users'], calls
            assert_equal ['dashboard_production_pii.zeroetl_users'], result[:statements].keys
          end

          it 'treats a view missing from SVV_MV_INFO as stale (rebuilds it)' do
            # No rows returned — staleness map is empty.
            client.stubs(:execute).returns([])
            client.stubs(:execute_async).returns('id-1', 'id-2')

            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_equal 2, result[:statements].length
          end

          it 'yields :submitted with table name and submitted FQNs' do
            client.stubs(:execute_async).returns('id-a', 'id-b')

            events = []
            MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model]
            ) {|event, payload, extra| events << [event, payload, extra]}

            submitted = events.find {|e| e[0] == :submitted}
            refute_nil submitted
            assert_equal 'users', submitted[1]
            assert_equal 2, submitted[2].length
          end

          it 'yields :no_views and skips models with no view variants' do
            empty_model = stub('empty_model',
              table_name: 'empties',
              primary_key: 'id',
              columns: []
            )
            client.expects(:execute_async).never

            events = []
            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [empty_model]
            ) {|event, payload, _| events << [event, payload]}

            assert_includes events, [:no_views, 'empties']
            assert_empty result[:statements]
          end

          it 'continues past per-model submit failures and records them under :failed' do
            call_count = 0
            client.stubs(:execute_async).with do |_sql|
              call_count += 1
              raise Cdo::Aws::Redshift::Client::QueryError, 'Refresh failed' if call_count == 1
              true
            end.returns('id-2', 'id-3')

            events = []
            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model, activities_model]
            ) {|event, payload, extra| events << [event, payload, extra]}

            error_events = events.select {|e| e[0] == :error}
            assert_equal 1, error_events.length
            assert_equal 'users', error_events[0][1]
            assert_instance_of Cdo::Aws::Redshift::Client::QueryError, error_events[0][2]
            assert_equal ['users'], result[:failed]

            # Subsequent model still got a :submitted event.
            assert(events.any? {|ev, payload, _| ev == :submitted && payload == 'activities'})
          end

          it 'returns empty result for an empty model set' do
            client.expects(:execute_async).never

            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: []
            )

            assert_empty result[:statements]
            assert_empty result[:failed]
          end

          it 'yields :would_refresh with the stale FQNs and submits nothing when dry_run is true' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'is_stale' => 't', 'state' => 100},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'is_stale' => 't', 'state' => 100}
              ]
            )
            client.expects(:execute_async).never

            events = []
            result = MaterializedViewGenerator.refresh_all_views(
              client: client, environment_type: :production, models: [model], dry_run: true
            ) {|event, table, payload| events << [event, table, payload]}

            would_refresh = events.find {|e| e[0] == :would_refresh}
            refute_nil would_refresh
            assert_equal 'users', would_refresh[1]
            assert_equal 2, would_refresh[2].length
            assert_includes would_refresh[2], 'dashboard_production_pii.zeroetl_users'

            assert_empty result[:statements]
            assert_empty result[:failed]
          end
        end

        describe '#distkey_clause (via generated DDL)' do
          it 'uses the first element of a composite primary key (double-quoted)' do
            model.stubs(:primary_key).returns(%w[user_id activity_id])
            model.stubs(:columns).returns([mock_column('user_id', :integer), mock_column('activity_id', :integer)])
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTSTYLE KEY DISTKEY ("user_id")'
          end

          it 'falls back to DISTSTYLE AUTO when primary_key is nil' do
            model.stubs(:primary_key).returns(nil)
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTSTYLE AUTO'
            refute_includes ddl, 'DISTKEY'
          end

          it 'falls back to DISTSTYLE AUTO when primary_key is blank' do
            model.stubs(:primary_key).returns('')
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTSTYLE AUTO'
            refute_includes ddl, 'DISTKEY'
          end

          it 'falls back to DISTSTYLE AUTO when distkey column is filtered out of the projection' do
            # Mirrors school_stats_by_years: composite PK whose leading column
            # is a string and so is dropped from the non-PII view.
            string_pk_col = mock_column('school_id', :string)
            year_col = mock_column('school_year', :string)
            int_col = mock_column('students_total', :integer)
            model.stubs(:primary_key).returns(%w[school_id school_year])
            model.stubs(:columns).returns([string_pk_col, year_col, int_col])

            non_pii = MaterializedViewGenerator.new(model).generate_non_pii_ddl
            assert_includes non_pii, 'DISTSTYLE AUTO'
            refute_includes non_pii, 'DISTKEY'
          end
        end

        describe 'reserved-word column names' do
          it 'double-quotes column identifiers in the SELECT list' do
            group_col = mock_column('group', :integer)
            end_col   = mock_column('end', :datetime)
            model.stubs(:columns).returns([id_col, group_col, end_col])

            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, '"id"'
            assert_includes ddl, '"group"'
            assert_includes ddl, '"end"'
          end
        end

        describe '#expected_view_fqns' do
          it 'returns both PII and non-PII FQNs when non-pii columns exist' do
            fqns = MaterializedViewGenerator.new(model).expected_view_fqns(:production)
            assert_equal %w[dashboard_production_pii.zeroetl_users dashboard_production.zeroetl_users], fqns
          end

          it 'returns only PII FQN when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            fqns = MaterializedViewGenerator.new(model).expected_view_fqns(:test)
            assert_equal %w[dashboard_test_pii.zeroetl_users], fqns
          end

          it 'returns empty array when model has no columns' do
            model.stubs(:columns).returns([])
            fqns = MaterializedViewGenerator.new(model).expected_view_fqns(:production)
            assert_empty fqns
          end

          it 'accepts string environment_type' do
            fqns = MaterializedViewGenerator.new(model).expected_view_fqns('test')
            assert_equal %w[dashboard_test_pii.zeroetl_users dashboard_test.zeroetl_users], fqns
          end
        end

        describe '.describe_mv_state' do
          it 'maps documented SVV_MV_INFO state codes to descriptions' do
            assert_equal 'Refreshes by full recompute', MaterializedViewGenerator.describe_mv_state(0)
            assert_equal 'Refreshes incrementally', MaterializedViewGenerator.describe_mv_state(1)
            assert_includes MaterializedViewGenerator.describe_mv_state(101), 'column was dropped'
            assert_includes MaterializedViewGenerator.describe_mv_state(105), 'schema was renamed'
          end

          it 'falls back to a generic rebuild message for undocumented state >= 100' do
            assert_includes MaterializedViewGenerator.describe_mv_state(199), 'rebuild required'
            assert_includes MaterializedViewGenerator.describe_mv_state(199), '199'
          end

          it 'reports unknown for an undocumented state < 100' do
            assert_includes MaterializedViewGenerator.describe_mv_state(42), 'Unknown'
          end

          it 'returns nil for a nil state' do
            assert_nil MaterializedViewGenerator.describe_mv_state(nil)
          end
        end

        describe '.sync_all_views' do
          let(:client) {mock('redshift_client')}
          let(:tmpdir) {Dir.mktmpdir}

          let(:activities_model) {stub}

          before do
            MaterializedViewGenerator.send(:remove_const, :SQL_VIEW_TEMPLATE_DIR)
            MaterializedViewGenerator.const_set(:SQL_VIEW_TEMPLATE_DIR, tmpdir)

            activities_model.stubs(:table_name).returns('activities')
            activities_model.stubs(:primary_key).returns('id')
            activities_model.stubs(:columns).returns([id_col, age_col, created_at_col])
          end

          after do
            FileUtils.remove_entry(tmpdir)
          end

          it 'classifies new views as to_add' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute_async)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_users'
            assert_empty plan[:to_update]
            assert_empty plan[:to_drop]
          end

          it 'classifies existing-but-stale views as to_update' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'comment' => nil},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'comment' => nil}
              ]
            )
            client.stubs(:batch_execute_async)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_empty plan[:to_add]
            assert_includes plan[:to_update], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_update], 'dashboard_production.zeroetl_users'
            assert_empty plan[:to_drop]
          end

          it 'classifies orphaned views as to_drop' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'comment' => nil},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'comment' => nil},
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_old_table', 'comment' => nil},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_old_table', 'comment' => nil}
              ]
            )
            client.stubs(:batch_execute_async)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_includes plan[:to_drop], 'dashboard_production_pii.zeroetl_old_table'
            assert_includes plan[:to_drop], 'dashboard_production.zeroetl_old_table'
          end

          it 'submits async batches for changed views and returns their statement IDs' do
            client.stubs(:execute).returns([])
            id_seq = 0
            client.stubs(:batch_execute_async).with do |_sqls|
              id_seq += 1
              "id-#{id_seq}"
            end

            result = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_equal 2, result[:statements].length
            assert(result[:statements].keys.any? {|fqn| fqn.include?('zeroetl_users')})
            refute_empty result[:to_add]
            assert_empty result[:failed]
          end

          it 'submits the orphan-drop batch async and includes it under __drop_orphans__' do
            client.stubs(:execute).returns(
              [{'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table', 'comment' => nil}]
            )
            submitted = []
            client.stubs(:batch_execute_async).with do |sqls|
              submitted << sqls
              "id-#{submitted.length}"
            end

            result = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :test, models: [model]
            )

            assert_includes result[:statements].keys, '__drop_orphans__'
            drop_sqls = submitted.find {|sqls| sqls.all? {|s| s.include?('DROP') && !s.include?('CREATE')}}
            refute_nil drop_sqls
            assert(drop_sqls.any? {|s| s.include?('zeroetl_old_table')})
          end

          it 'does not submit anything when dry_run is true' do
            client.stubs(:execute).returns(
              [{'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table', 'comment' => nil}]
            )
            client.expects(:batch_execute_async).never

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :test, models: [model], dry_run: true
            )

            refute_empty plan[:to_add]
            refute_empty plan[:to_drop]
            assert_empty plan[:statements]
          end

          it 'does not yield any events on dry_run' do
            client.stubs(:execute).returns(
              [{'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table', 'comment' => nil}]
            )

            events = []
            MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :test, models: [model], dry_run: true
            ) {|event, _, _| events << event}

            assert_empty events
          end

          it 'yields :submitted with table name and submitted FQNs per model' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute_async).returns('id-1', 'id-2')

            events = []
            MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            ) {|event, payload, extra| events << [event, payload, extra]}

            submitted = events.find {|e| e[0] == :submitted}
            refute_nil submitted
            assert_equal 'users', submitted[1]
            assert_equal 2, submitted[2].length
          end

          it 'yields :drop_batch_submitted with the orphan FQNs' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table', 'comment' => nil},
                {'schema' => 'dashboard_test', 'name' => 'zeroetl_old_table', 'comment' => nil}
              ]
            )
            client.stubs(:batch_execute_async).returns('id')

            drop_events = []
            MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :test, models: [model]
            ) {|event, payload, _| drop_events << payload if event == :drop_batch_submitted}

            assert_equal 1, drop_events.length
            assert_includes drop_events[0], 'dashboard_test_pii.zeroetl_old_table'
            assert_includes drop_events[0], 'dashboard_test.zeroetl_old_table'
          end

          it 'does not yield :drop_batch_submitted when to_drop is empty' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute_async).returns('id')

            events = []
            MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            ) {|event, _payload, _| events << event}

            refute_includes events, :drop_batch_submitted
          end

          it 'continues past per-model submit failures and records them under :failed' do
            client.stubs(:execute).returns([])
            call_count = 0
            client.stubs(:batch_execute_async).with do |_sqls|
              call_count += 1
              raise Cdo::Aws::Redshift::Client::QueryError, 'Submit failed' if call_count == 1
              "id-#{call_count}"
            end

            events = []
            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model, activities_model]
            ) {|event, payload, extra| events << [event, payload, extra]}

            error_events = events.select {|e| e[0] == :error}
            assert_equal 1, error_events.length
            assert_equal 'users', error_events[0][1]
            assert_instance_of Cdo::Aws::Redshift::Client::QueryError, error_events[0][2]

            assert_equal ['users'], plan[:failed]
            # Subsequent model still got a :submitted event.
            assert(events.any? {|ev, payload, _| ev == :submitted && payload == 'activities'})
          end

          it 'reports an empty :failed array when all submits succeed' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute_async)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            assert_empty plan[:failed]
          end

          it 'skips models whose existing comment hash matches the desired DDL' do
            generator = MaterializedViewGenerator.new(model)
            desired = generator.rendered_ddls(environment_type: :production)

            client.stubs(:execute).returns(
              desired.map do |fqn, info|
                schema, name = fqn.split('.', 2)
                {'schema' => schema, 'name' => name, 'comment' => Digest::SHA256.hexdigest(info[:sql])}
              end
            )
            client.expects(:batch_execute_async).never

            events = []
            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            ) {|event, payload, _| events << [event, payload]}

            assert_includes events, [:skipped, 'users']
            refute_empty plan[:unchanged]
            assert_empty plan[:to_add]
            assert_empty plan[:to_update]
            assert_empty plan[:statements]
          end

          it 'recreates models whose existing comment hash differs from the desired DDL' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'comment' => 'stale-hash'},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'comment' => 'also-stale'}
              ]
            )
            submitted = []
            client.stubs(:batch_execute_async).with {|sqls| submitted << sqls; 'id'}

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            refute_empty submitted
            refute_empty plan[:to_update]
            assert_empty plan[:unchanged]
          end

          it 'recreates models whose existing views have no comment' do
            # Views created before this change shipped have no COMMENT stored;
            # the catalog query reports comment=nil. Treat as "unknown" and rebuild.
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users', 'comment' => nil},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users', 'comment' => nil}
              ]
            )
            submitted = []
            client.stubs(:batch_execute_async).with {|sqls| submitted << sqls; 'id'}

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model]
            )

            refute_empty submitted
            assert_empty plan[:unchanged]
          end

          it 'handles multiple models' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute_async)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :production, models: [model, activities_model]
            )

            assert_equal 4, plan[:to_add].length
            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_activities'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_activities'
          end

          it 'handles empty model set' do
            client.stubs(:execute).returns(
              [{'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table', 'comment' => nil}]
            )
            client.stubs(:batch_execute_async).returns('id')

            plan = MaterializedViewGenerator.sync_all_views(
              client: client, environment_type: :test, models: []
            )

            assert_empty plan[:to_add]
            assert_empty plan[:to_update]
            assert_includes plan[:to_drop], 'dashboard_test_pii.zeroetl_old_table'
          end
        end

        describe '.wait_for_statements' do
          let(:client) {mock('redshift_client')}

          it 'polls every statement and returns finished/failed FQN partitions' do
            client.stubs(:status).with('id-a').returns('STARTED', 'FINISHED')
            client.stubs(:status).with('id-b').returns('STARTED', 'STARTED', 'FAILED')
            client.stubs(:describe_statement).with('id-b').returns(stub('desc', error: "Bad query\nwith details", sub_statements: []))

            events = []
            result = MaterializedViewGenerator.wait_for_statements(
              client: client,
              statements: {'a' => 'id-a', 'b' => 'id-b'},
              poll_interval: 0
            ) {|event, fqn, _| events << [event, fqn]}

            assert_equal ['a'], result[:finished]
            assert_equal [['b', 'Bad query']], result[:failed]
            assert_includes events, [:finished, 'a']
            assert_includes events, [:failed, 'b']
          end

          it 'raises QueryError when the timeout is exceeded' do
            client.stubs(:status).returns('STARTED')

            assert_raises(Cdo::Aws::Redshift::Client::QueryError) do
              MaterializedViewGenerator.wait_for_statements(
                client: client,
                statements: {'a' => 'id-a'},
                poll_interval: 0,
                timeout: 0
              )
            end
          end

          it 'returns immediately for an empty statement set without polling' do
            client.expects(:status).never

            result = MaterializedViewGenerator.wait_for_statements(
              client: client, statements: {}, poll_interval: 0
            )

            assert_empty result[:finished]
            assert_empty result[:failed]
          end

          it 'treats ABORTED as a failed terminal state' do
            client.stubs(:status).with('id-a').returns('ABORTED')
            client.stubs(:describe_statement).with('id-a').returns(stub('desc', error: nil, sub_statements: []))

            result = MaterializedViewGenerator.wait_for_statements(
              client: client, statements: {'a' => 'id-a'}, poll_interval: 0
            )

            assert_equal [['a', '(ABORTED)']], result[:failed]
          end
        end
      end
    end
  end
end
