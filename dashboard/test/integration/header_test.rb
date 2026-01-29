require 'test_helper'

class HeaderTest < ActionDispatch::IntegrationTest
  context 'when signed out' do
    around do |test|
      get '/catalog'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', CDO.code_org_url
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'Learn'      => CDO.code_org_url('/students'),
          'Teach'      => CDO.code_org_url('/teach'),
          'Districts'  => CDO.code_org_url('/administrators'),
          'Stats'      => CDO.code_org_url('/promote'),
          'Donate'     => CDO.code_org_url('/donate'),
          'Incubator'  => CDO.code_org_url('/incubator'),
          'About'      => CDO.code_org_url('/about')
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project links' do
        must_select '#header_create_menu[role="button"]', /New project/ do
          {
            'Sprite Lab'        => spritelab_project_create_new_projects_url,
            'Artist'            => artist_project_create_new_projects_url,
            'App Lab'           => applab_project_create_new_projects_url,
            'Game Lab'          => gamelab_project_create_new_projects_url,
            'Music Lab'         => CDO.code_org_url('/music'),
            'Dance Party'       => dance_project_create_new_projects_url,
            /View all projects/ => projects_url
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders sign in button' do
        must_select '#signin_button[href=?]',
                    user_session_url,
                    'Sign in'
      end

      it 'renders Sign in button' do
        must_select '#create_account_button[href=?]',
                    users_sign_up_account_type_url,
                    'Create account'
      end

      describe 'hamburger menu' do
        around do |test|
          must_select '#hamburger' do
            test.call
          end
        end

        it 'renders links' do
          {
            'Learn'            => CDO.code_org_url('/students'),
            'Districts'        => CDO.code_org_url('/administrators'),
            'Stats'            => CDO.code_org_url('/promote'),
            'Donate'           => CDO.code_org_url('/donate'),
            'Incubator'        => CDO.code_org_url('/incubator'),
            'Help and support' => 'https://support.code.org',
            'Report a problem' => 'https://support.code.org/hc/en-us/requests/new',
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end

        it 'renders links within Teach submenu' do
          must_select '#educate_entries', 'Teach'
          must_select '#educate_entries-items' do
            {
              'Educator Overview'      => CDO.code_org_url('/teach'),
              'Course Catalog'         => catalog_url,
              'Elementary School'      => CDO.code_org_url('/educate/curriculum/elementary-school'),
              'Middle School'          => CDO.code_org_url('/educate/curriculum/middle-school'),
              'High School'            => CDO.code_org_url('/educate/curriculum/high-school'),
              'Hour of Code'           => 'https://hourofcode.com',
              'Beyond Code.org'        => CDO.code_org_url('/educate/curriculum/3rd-party'),
              'Online Community'       => 'https://forum.code.org/',
              'Technical Requirements' => CDO.code_org_url('/educate/it'),
              'Tools and Videos'       => CDO.code_org_url('/educate/resources/videos'),
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end

        it 'renders links within About submenu' do
          must_select '#about_entries', 'About'
          must_select '#about_entries-items' do
            {
              'About Us'    => CDO.code_org_url('/about'),
              'Leadership'  => CDO.code_org_url('/about/leadership'),
              'Donors'      => CDO.code_org_url('/about/donors'),
              'Partners'    => CDO.code_org_url('/about/partners'),
              'Full Team'   => CDO.code_org_url('/about/team'),
              'Newsroom'    => CDO.code_org_url('/about/news'),
              'Careers'     => CDO.code_org_url('/about/jobs'),
              'Contact Us'  => CDO.code_org_url('/contact'),
              'FAQs'        => CDO.code_org_url('/faq'),
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end

        it 'renders links within Privacy & Legal submenu' do
          must_select '#legal_entries', 'Privacy & Legal'
          must_select '#legal_entries-items' do
            {
              'Privacy Policy'   => CDO.code_org_url('/privacy'),
              'Cookie Notice'    => CDO.code_org_url('/cookies'),
              'Terms of Service' => CDO.code_org_url('/terms-of-service')
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end
      end
    end
  end

  context 'when signed in as teacher' do
    let(:teacher) {create(:teacher)}

    before do
      sign_in teacher
    end

    around do |test|
      get '/teacher_dashboard/home'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', '/home'
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'My Dashboard'          => home_url,
          'Course Catalog'        => catalog_url,
          'Projects'              => projects_url,
          'Professional Learning' => professional_learning_url,
          'Incubator'             => CDO.code_org_url('/incubator')
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project button' do
        must_select '#header_create_menu[role="button"]', /New project/
      end

      it 'renders account links' do
        must_select '#header_user_menu[role="button"]', Regexp.new(teacher.short_name) do
          {
            'My projects'      => projects_url,
            'Account settings' => users_edit_url,
            'Sign out'         => destroy_user_session_url
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders hamburger menu' do
        must_select '#hamburger'
      end
    end
  end

  context 'when signed in as student' do
    let(:student) {create(:student)}

    before do
      sign_in student
    end

    around do |test|
      get '/home'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'left part' do
      around do |test|
        must_select '.header_left' do
          test.call
        end
      end

      it 'renders home icon link' do
        must_select '#logo_home_link[href=?]', '/home'
      end
    end

    describe 'middle part' do
      around do |test|
        must_select '.header_middle' do
          test.call
        end
      end

      it 'renders links' do
        {
          'My Dashboard'          => home_url,
          'Course Catalog'        => CDO.code_org_url('/students'),
          'Projects'              => projects_url,
          'Incubator'             => CDO.code_org_url('/incubator')
        }.each do |text, href|
          must_select 'a[href=?]', href, text
        end
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders new project button' do
        must_select '#header_create_menu[role="button"]', /New project/
      end

      it 'renders account links' do
        must_select '#header_user_menu[role="button"]', Regexp.new(student.short_name) do
          {
            'My projects'      => projects_url,
            'Account settings' => users_edit_url,
            'Sign out'         => destroy_user_session_url,
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders hamburger menu' do
        must_select '#hamburger'
      end
    end
  end

  context 'on lab page' do
    let!(:spritelab) do
      spritelab_name = ProjectsController::STANDALONE_PROJECTS[:spritelab][:name]
      Level.find_by_name(spritelab_name) || create(:spritelab, name: spritelab_name)
    end

    around do |test|
      get '/projects/spritelab/fake-channel-id/edit'

      must_select '.header-wrapper' do
        test.call
      end
    end

    describe 'right part' do
      around do |test|
        must_select '.header_right' do
          test.call
        end
      end

      it 'renders lab specific helper links' do
        must_select '#help-button #help-contents' do
          must_select 'a[href^="https://support.code.org/hc/en-us/requests/new"]', 'Report a problem'

          {
            'Sprite Lab Documentation' => CDO.studio_url('/docs/spritelab'),
            'Sprite Lab Tutorials'     => CDO.code_org_url('/educate/spritelab'),
            'Help and support'         => 'https://support.code.org',
            'Report abuse'             => report_abuse_url,
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end
    end
  end
end
