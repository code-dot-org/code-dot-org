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

          it 'uses the primary key as the distkey' do
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
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

          it 'batch executes DROP and CREATE for both views' do
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            result = generator.create_or_replace_views(client: client, environment_type: :production)

            assert_equal 2, batches.length
            assert_equal 'DROP MATERIALIZED VIEW IF EXISTS dashboard_production_pii.zeroetl_users', batches[0][0]
            assert_includes batches[0][1], 'CREATE MATERIALIZED VIEW dashboard_production_pii.zeroetl_users'
            assert_equal 'DROP MATERIALIZED VIEW IF EXISTS dashboard_production.zeroetl_users', batches[1][0]
            assert_includes batches[1][1], 'CREATE MATERIALIZED VIEW dashboard_production.zeroetl_users'

            assert_equal ['dashboard_production_pii.zeroetl_users', 'dashboard_production.zeroetl_users'], result
          end

          it 'saves ERB template files to the template directory' do
            client.stubs(:batch_execute)
            generator.create_or_replace_views(client: client, environment_type: :test)

            assert File.exist?(File.join(tmpdir, 'users_pii.sql.erb'))
            assert File.exist?(File.join(tmpdir, 'users.sql.erb'))
          end

          it 'renders ERB placeholders in the CREATE SQL' do
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            generator.create_or_replace_views(client: client, environment_type: :test)

            batches.each do |sqls|
              assert_includes sqls[1], 'test_learningplatform_mysql_zeroetl.dashboard_test.users'
              refute_includes sqls[1], '<%='
            end
          end

          it 'accepts symbol environment_type' do
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            result = generator.create_or_replace_views(client: client, environment_type: :production)

            assert_includes batches[0][0], 'dashboard_production_pii'
            assert_equal 'dashboard_production_pii.zeroetl_users', result[0]
          end

          it 'returns empty array when model has no columns' do
            model.stubs(:columns).returns([])
            result = generator.create_or_replace_views(client: client, environment_type: :production)
            assert_empty result
          end

          it 'skips non-pii view when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            result = generator.create_or_replace_views(client: client, environment_type: :production)

            assert_equal 1, batches.length
            assert_equal 'DROP MATERIALIZED VIEW IF EXISTS dashboard_production_pii.zeroetl_users', batches[0][0]
            assert_includes batches[0][1], 'CREATE MATERIALIZED VIEW dashboard_production_pii.zeroetl_users'
            assert_equal ['dashboard_production_pii.zeroetl_users'], result
          end
        end

        describe '#refresh_views' do
          let(:generator) {MaterializedViewGenerator.new(model)}
          let(:client) {mock('redshift_client')}

          it 'batch executes REFRESH for both PII and non-PII views' do
            batch = nil
            client.stubs(:batch_execute).with {|sqls| batch = sqls; true}

            result = generator.refresh_views(client: client, environment_type: :production)

            assert_equal 2, batch.length
            assert_equal 'REFRESH MATERIALIZED VIEW dashboard_production_pii.zeroetl_users', batch[0]
            assert_equal 'REFRESH MATERIALIZED VIEW dashboard_production.zeroetl_users', batch[1]
            assert_equal ['dashboard_production_pii.zeroetl_users', 'dashboard_production.zeroetl_users'], result
          end

          it 'accepts symbol environment_type' do
            batch = nil
            client.stubs(:batch_execute).with {|sqls| batch = sqls; true}

            result = generator.refresh_views(client: client, environment_type: :test)

            assert_includes batch[0], 'dashboard_test_pii'
            assert_equal 'dashboard_test_pii.zeroetl_users', result[0]
          end

          it 'returns empty array when model has no columns' do
            model.stubs(:columns).returns([])
            result = generator.refresh_views(client: client, environment_type: :production)
            assert_empty result
          end

          it 'skips non-pii view when all columns are text' do
            model.stubs(:columns).returns([name_col, bio_col])
            batch = nil
            client.stubs(:batch_execute).with {|sqls| batch = sqls; true}

            result = generator.refresh_views(client: client, environment_type: :production)

            assert_equal 1, batch.length
            assert_equal 'REFRESH MATERIALIZED VIEW dashboard_production_pii.zeroetl_users', batch[0]
            assert_equal ['dashboard_production_pii.zeroetl_users'], result
          end
        end

        describe '#distkey_column (via generated DDL)' do
          it 'uses the first element of a composite primary key' do
            model.stubs(:primary_key).returns(%w[user_id activity_id])
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (user_id)'
          end

          it 'falls back to id when primary_key is nil' do
            model.stubs(:primary_key).returns(nil)
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
          end

          it 'falls back to id when primary_key is blank' do
            model.stubs(:primary_key).returns('')
            ddl = MaterializedViewGenerator.new(model).generate_pii_ddl
            assert_includes ddl, 'DISTKEY (id)'
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
            client.stubs(:batch_execute)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :production,
              models: [model]
            )

            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_users'
            assert_empty plan[:to_update]
            assert_empty plan[:to_drop]
          end

          it 'classifies existing views as to_update' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users'},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users'}
              ]
            )
            client.stubs(:batch_execute)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :production,
              models: [model]
            )

            assert_empty plan[:to_add]
            assert_includes plan[:to_update], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_update], 'dashboard_production.zeroetl_users'
            assert_empty plan[:to_drop]
          end

          it 'classifies orphaned views as to_drop' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_users'},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_users'},
                {'schema' => 'dashboard_production_pii', 'name' => 'zeroetl_old_table'},
                {'schema' => 'dashboard_production', 'name' => 'zeroetl_old_table'}
              ]
            )
            client.stubs(:batch_execute)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :production,
              models: [model]
            )

            assert_includes plan[:to_drop], 'dashboard_production_pii.zeroetl_old_table'
            assert_includes plan[:to_drop], 'dashboard_production.zeroetl_old_table'
          end

          it 'executes create_or_replace and drop when not dry_run' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table'}
              ]
            )
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :test,
              models: [model]
            )

            create_batches = batches.select {|b| b.any? {|s| s.include?('CREATE')}}
            drop_batches = batches.select {|b| b.all? {|s| s.include?('DROP') && !s.include?('CREATE')}}

            refute_empty create_batches
            assert_equal 1, drop_batches.length
            assert_includes drop_batches[0][0], 'zeroetl_old_table'
          end

          it 'does not execute anything when dry_run is true' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table'}
              ]
            )

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :test,
              models: [model],
              dry_run: true
            )

            refute_empty plan[:to_add]
            refute_empty plan[:to_drop]
          end

          it 'handles multiple models' do
            client.stubs(:execute).returns([])
            client.stubs(:batch_execute)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :production,
              models: [model, activities_model]
            )

            assert_equal 4, plan[:to_add].length
            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_users'
            assert_includes plan[:to_add], 'dashboard_production_pii.zeroetl_activities'
            assert_includes plan[:to_add], 'dashboard_production.zeroetl_activities'
          end

          it 'does not issue a standalone DROP batch when to_drop is empty' do
            client.stubs(:execute).returns([])
            batches = []
            client.stubs(:batch_execute).with {|sqls| batches << sqls; true}

            MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :test,
              models: [model]
            )

            batches.each do |batch|
              assert batch.any? {|sql| sql.include?('CREATE')},
                "Expected every batch to contain a CREATE statement, got: #{batch}"
            end
          end

          it 'handles empty model set' do
            client.stubs(:execute).returns(
              [
                {'schema' => 'dashboard_test_pii', 'name' => 'zeroetl_old_table'}
              ]
            )
            client.stubs(:batch_execute)

            plan = MaterializedViewGenerator.sync_all_views(
              client: client,
              environment_type: :test,
              models: []
            )

            assert_empty plan[:to_add]
            assert_empty plan[:to_update]
            assert_includes plan[:to_drop], 'dashboard_test_pii.zeroetl_old_table'
          end
        end
      end
    end
  end
end
