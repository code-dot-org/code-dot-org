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
        must_select '#logo_home_link[href=?]', '//test.code.org'
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
          'Learn'      => '//test.code.org/students',
          'Teach'      => '//test.code.org/teach',
          'Districts'  => '//test.code.org/administrators',
          'Stats'      => '//test.code.org/promote',
          'Donate'     => '//test.code.org/donate',
          'Incubator'  => '//test.code.org/incubator',
          'About'      => '//test.code.org/about'
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
            'Sprite Lab'        => '//test-studio.code.org/projects/spritelab/new',
            'Artist'            => '//test-studio.code.org/projects/artist/new',
            'App Lab'           => '//test-studio.code.org/projects/applab/new',
            'Game Lab'          => '//test-studio.code.org/projects/gamelab/new',
            'Music Lab'         => '//test.code.org/music',
            'Dance Party'       => '//test-studio.code.org/projects/dance/new',
            /View all projects/ => '//test-studio.code.org/projects'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end

      it 'renders sign in button' do
        must_select '#signin_button[href=?]',
                    '//test-studio.code.org/users/sign_in',
                    'Sign in'
      end

      it 'renders Sign in button' do
        must_select '#create_account_button[href=?]',
                    '//test-studio.code.org/users/sign_up/account_type',
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
            'Learn'            => '//test.code.org/students',
            'Districts'        => '//test.code.org/administrators',
            'Stats'            => '//test.code.org/promote',
            'Donate'           => '//test.code.org/donate',
            'Incubator'        => '//test.code.org/incubator',
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
              'Educator Overview'      => '//test.code.org/teach',
              'Course Catalog'         => '//test-studio.code.org/catalog',
              'Elementary School'      => '//test.code.org/educate/curriculum/elementary-school',
              'Middle School'          => '//test.code.org/educate/curriculum/middle-school',
              'High School'            => '//test.code.org/educate/curriculum/high-school',
              'Hour of Code'           => 'https://hourofcode.com',
              'Beyond Code.org'        => '//test.code.org/educate/curriculum/3rd-party',
              'Online Community'       => 'https://forum.code.org/',
              'Technical Requirements' => '//test.code.org/educate/it',
              'Tools and Videos'       => '//test.code.org/educate/resources/videos',
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end

        it 'renders links within About submenu' do
          must_select '#about_entries', 'About'
          must_select '#about_entries-items' do
            {
              'About Us'    => '//test.code.org/about',
              'Leadership'  => '//test.code.org/about/leadership',
              'Donors'      => '//test.code.org/about/donors',
              'Partners'    => '//test.code.org/about/partners',
              'Full Team'   => '//test.code.org/about/team',
              'Newsroom'    => '//test.code.org/about/news',
              'Careers'     => '//test.code.org/about/jobs',
              'Contact Us'  => '//test.code.org/contact',
              'FAQs'        => '//test.code.org/faq',
            }.each do |text, href|
              must_select 'a[href=?]', href, text
            end
          end
        end

        it 'renders links within Privacy & Legal submenu' do
          must_select '#legal_entries', 'Privacy & Legal'
          must_select '#legal_entries-items' do
            {
              'Privacy Policy'   => '//test.code.org/privacy',
              'Cookie Notice'    => '//test.code.org/cookies',
              'Terms of Service' => '//test.code.org/tos'
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
          'My Dashboard'          => '//test-studio.code.org/home',
          'Course Catalog'        => '//test-studio.code.org/catalog',
          'Projects'              => '//test-studio.code.org/projects',
          'Professional Learning' => '//test-studio.code.org/my-professional-learning',
          'Incubator'             => '//test.code.org/incubator'
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
            'My projects'      => '//test-studio.code.org/projects',
            'Account settings' => '//test-studio.code.org/users/edit',
            'Sign out'         => '//test-studio.code.org/users/sign_out'
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
          'My Dashboard'          => '//test-studio.code.org/home',
          'Course Catalog'        => '//test.code.org/students',
          'Projects'              => '//test-studio.code.org/projects',
          'Incubator'             => '//test.code.org/incubator'
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
            'My projects'      => '//test-studio.code.org/projects',
            'Account settings' => '//test-studio.code.org/users/edit',
            'Sign out'         => '//test-studio.code.org/users/sign_out'
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
            'Sprite Lab Documentation' => '//test-studio.code.org/docs/spritelab',
            'Sprite Lab Tutorials'     => '//test.code.org/educate/spritelab',
            'Help and support'         => 'https://support.code.org',
            'Report abuse'             => '//test-studio.code.org/report_abuse'
          }.each do |text, href|
            must_select 'a[href=?]', href, text
          end
        end
      end
    end
  end
end
