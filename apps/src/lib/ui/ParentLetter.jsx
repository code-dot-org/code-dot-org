import React from 'react';
import color from '../../util/color';

export default () => (
  <div>
    <Header />
    <article>
      <p>Hello!</p>
      <p>
        In my class, your child is learning computer science on Code.org, a fun,
        creative platform for learning computer science and basic coding. Your
        interest in what your child is learning is critical, and Code.org makes
        it easy to stay involved.
      </p>
      <h1>Step 1 - Encourage your child, show interest</h1>
      <p>
        One of the best ways to show your interest is to ask your child to
        explain what they’re learning and show you a project they are proud of
        (details on how to engage your child).
      </p>
      <h1>Step 2 - Get your child set up to use Code.org at home</h1>
      <p>
        Our class uses secret words to login. To have your student login at
        home, do the following:
        <ol>
          <li>
            Go to <a href="#">studio.code.org/sections/SBGJQS</a> and click on
            their name
          </li>
          <li>Type in their secret words and hit ‘sign in’</li>
        </ol>
        At the top of their homepage, your student can continue the course they
        are doing with their classroom at school. They can also create their own
        games or artwork in the Project Gallery or check out code.org/athome for
        ideas for things to work on at home.
      </p>
      <h1>Step 3 - Connect your email to your student’s account</h1>
      <p>
        Keep up to date with what your student is working on and receive updates
        from Code.org.
        <ol>
          <li>Have your child sign in to Code.org</li>
          <li>
            Click on the User Menu in the top right corner of the site, then
            click on Account Settings.
          </li>
          <li>
            Scroll down to the section “For Parents and Guardians” and add your
            email address.
          </li>
        </ol>
      </p>
      <h1>Step 4 - Review Code.org’s privacy policy</h1>
      <p>
        Code.org assigns utmost importance to student safety and security.
        Code.org has signed the Student Privacy Pledge and their privacy
        practices have received one of the highest overall scores from Common
        Sense Media. You can find further details by viewing Code.org’s Privacy
        Policy.
      </p>
      <p>
        Computer science teaches students critical thinking, problem solving,
        and digital citizenship, and benefits all students in today’s world, no
        matter what opportunities they pursue in the future.
      </p>
      <p>
        Please let me know if you have any questions and thank you for your
        continued support of your child and of our classroom!
      </p>
      <p>[Teacher name]</p>
    </article>
  </div>
);

const Header = () => {
  return (
    <header style={{backgroundColor: color.teal, marginBottom: 30}}>
      <img
        src="/shared/images/CodeLogo_White.png"
        style={{
          height: 30,
          margin: 15
        }}
      />
    </header>
  );
};
