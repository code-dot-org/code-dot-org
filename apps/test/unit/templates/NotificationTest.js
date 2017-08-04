import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Notification from '@cdo/apps/templates/Notification';
import Button from '@cdo/apps/templates//Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const announcement = {
  heading: "Go beyond an Hour of Code",
  buttonText: "Go Beyond",
  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
};

const information = {
  notice: "Did you know Clark Kent grew up in Kansas?",
  details: "Seriously, Kansas. Earth's greatest hero is from a tiny called Smallville, if you can believe it.",
  dismissible: true
};

const success = {
  notice: "Wonder Woman Saved the Day",
  details: "Things were pretty sketchy there for awhile, but don't worry- she's on top of it.",
  dismissible: true
};

const failure = {
  notice: "Lex Luthor Attacked Metropolis",
  details: "If you're in the Metropolis area, get to saftey as quickly as possible",
  dismissible: false
};

const warning = {
  notice: "Batman is on Vacation in the Bahamas",
  details: "Now is probably not the best time to be in Gotham City. Watch your back.",
  dismissible: true
};

const findCourse = {
  notice: "Find a course",
  details: "Try new courses to add them to your homepage.",
  buttonText: "Find a course",
  link: "/courses",
  dismissible: false
};

describe('Notification', () => {
  it('renders an announcement notification', () => {
    const wrapper = shallow(
      <Notification
        type="bullhorn"
        notice={announcement.heading}
        details={announcement.description}
        dismissible={false}
        buttonText={announcement.buttonText}
        buttonLink={announcement.link}
        newWindow={true}
        analyticId={announcement.id}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="bullhorn"/>
          </div>
          <div>
            <div>
              {announcement.heading}
            </div>
            <div>
              {announcement.description}
            </div>
          </div>
          <Button
            href={announcement.link}
            text={announcement.buttonText}
            target="_blank"
          />
        </div>
        <div/>
      </div>
    );
  });
  it('renders an information notification', () => {
    const wrapper = shallow(
      <Notification
        type="information"
        notice={information.notice}
        details={information.details}
        dismissible={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="info-circle"/>
          </div>
          <div>
            <div>
              {information.notice}
            </div>
            <div>
              {information.details}
            </div>
          </div>
        </div>
        <div/>
      </div>
    );
  });
  it('renders a success notification', () => {
    const wrapper = shallow(
      <Notification
        type="success"
        notice={success.notice}
        details={success.details}
        dismissible={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="check-circle"/>
          </div>
          <div>
            <div>
              {success.notice}
            </div>
            <div>
              {success.details}
            </div>
          </div>
        </div>
        <div/>
      </div>
    );
  });
  it('renders a failure notification', () => {
    const wrapper = shallow(
      <Notification
        type="failure"
        notice={failure.notice}
        details={failure.details}
        dismissible={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="exclamation-triangle"/>
          </div>
          <div>
            <div>
              {failure.notice}
            </div>
            <div>
              {failure.details}
            </div>
          </div>
        </div>
        <div/>
      </div>
    );
  });
  it('renders a warning notification', () => {
    const wrapper = shallow(
      <Notification
        type="warning"
        notice={warning.notice}
        details={warning.details}
        dismissible={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="exclamation-triangle"/>
          </div>
          <div>
            <div>
              {warning.notice}
            </div>
            <div>
              {warning.details}
            </div>
          </div>
        </div>
        <div/>
      </div>
    );
  });
  it('renders a find a course notification', () => {
    const wrapper = shallow(
      <Notification
        type="course"
        notice={findCourse.notice}
        details={findCourse.details}
        dismissible={false}
        buttonText={findCourse.buttonText}
        buttonLink={findCourse.link}
        newWindow={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <div>
              {findCourse.notice}
            </div>
            <div>
              {findCourse.details}
            </div>
          </div>
          <Button
            href={findCourse.link}
            text={findCourse.buttonText}
            target="_blank"
          />
        </div>
        <div/>
      </div>
    );
  });
  it('renders a dismissible notification', () => {
    const wrapper = shallow(
      <Notification
        type="information"
        notice={information.notice}
        details={information.details}
        dismissible={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            <FontAwesome icon="info-circle"/>
          </div>
          <FontAwesome icon="times"/>
          <div>
            <div>
              {information.notice}
            </div>
            <div>
              {information.details}
            </div>
          </div>
        </div>
        <div/>
      </div>
    );
  });
});
