import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import Notification from '@cdo/apps/sharedComponents/Notification';

const announcement = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link: 'https://hourofcode.com/beyond',
};

const announcementNoLink = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
};

const information = {
  notice: 'Did you know Clark Kent grew up in Kansas?',
  details:
    "Seriously, Kansas. Earth's greatest hero is from a tiny called Smallville, if you can believe it.",
  dismissible: true,
  tooltip: 'Kansas is a state in the United States of America.',
};

const success = {
  notice: 'Wonder Woman Saved the Day',
  details:
    "Things were pretty sketchy there for awhile, but don't worry- she's on top of it.",
  dismissible: true,
};

const failure = {
  notice: 'Lex Luthor Attacked Metropolis',
  details:
    "If you're in the Metropolis area, get to saftey as quickly as possible",
  dismissible: false,
};

const warning = {
  notice: 'Batman is on Vacation in the Bahamas',
  details:
    'Now is probably not the best time to be in Gotham City. Watch your back.',
  dismissible: true,
};

const collaborate = {
  notice: 'Batman invited Superman to collab',
  details: 'Will the Justice League join forces again?',
};

const findCourse = {
  notice: 'Find a course',
  details: 'Try new courses to add them to your homepage.',
  buttonText: 'Find a course',
  link: '/courses',
  dismissible: false,
};

const firehoseAnalyticsData = {
  user_id: 1,
  important_data_point: 2,
};

const store = createStore(combineReducers({isRtl}));

function wrapped(element) {
  return mount(<Provider store={store}>{element}</Provider>);
}

describe('Notification', () => {
  it('renders an announcement notification', () => {
    const wrapper = wrapped(
      <Notification
        type="bullhorn"
        notice={announcement.heading}
        details={announcement.description}
        dismissible={false}
        buttonText={announcement.buttonText}
        buttonLink={announcement.link}
        newWindow={true}
        firehoseAnalyticsData={firehoseAnalyticsData}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="bullhorn" />
            </div>
            <div>
              <div>
                <div>{announcement.heading}</div>
                <div>{announcement.description}</div>
              </div>
              <div>
                <Button
                  href={announcement.link}
                  text={announcement.buttonText}
                />
              </div>
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders an announcement notification with no button because no link provided', () => {
    const wrapper = wrapped(
      <Notification
        type="bullhorn"
        notice={announcementNoLink.heading}
        details={announcementNoLink.description}
        dismissible={false}
        buttonText={announcementNoLink.buttonText}
        buttonLink={announcementNoLink.link}
        newWindow={true}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="bullhorn" />
            </div>
            <div>
              <div>
                <div>{announcementNoLink.heading}</div>
                <div>{announcementNoLink.description}</div>
              </div>
              <div />
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders an information notification', () => {
    const wrapper = wrapped(
      <Notification
        type="information"
        notice={information.notice}
        details={information.details}
        dismissible={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="info-circle" />
            </div>
            <div>
              <div>
                <div>{information.notice}</div>
                <div>{information.details}</div>
              </div>
              <div />
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders a success notification', () => {
    const wrapper = wrapped(
      <Notification
        type="success"
        notice={success.notice}
        details={success.details}
        dismissible={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="check-circle" />
            </div>
            <div>
              <div>
                <div>{success.notice}</div>
                <div>{success.details}</div>
              </div>
              <div />
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders a failure notification', () => {
    const wrapper = wrapped(
      <Notification
        type="failure"
        notice={failure.notice}
        details={failure.details}
        dismissible={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="exclamation-triangle" />
            </div>
            <div>
              <div>
                <div>{failure.notice}</div>
                <div>{failure.details}</div>
              </div>
              <div />
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders a warning notification', () => {
    const wrapper = wrapped(
      <Notification
        type="warning"
        notice={warning.notice}
        details={warning.details}
        dismissible={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <FontAwesome icon="exclamation-triangle" />
            </div>
            <div>
              <div>
                <div>{warning.notice}</div>
                <div>{warning.details}</div>
              </div>
              <div />
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders a find a course notification', () => {
    const wrapper = wrapped(
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
    expect(
      wrapper.containsMatchingElement(
        <div>
          <div>
            <div>
              <div>
                <div>{findCourse.notice}</div>
                <div>{findCourse.details}</div>
              </div>
              <div>
                <Button href={findCourse.link} text={findCourse.buttonText} />
              </div>
            </div>
          </div>
          <div />
        </div>
      )
    );
  });
  it('renders a collaborate notification', () => {
    const wrapper = wrapped(
      <Notification
        type="collaborate"
        notice={collaborate.notice}
        details={collaborate.details}
        dismissible={false}
      />
    );
    expect(wrapper.find('FontAwesome').length).toBe(1);
    expect(wrapper.find('FontAwesome').at(0).props().icon).toBe('users');
    expect(wrapper.text()).toContain(collaborate.notice);
    expect(wrapper.text()).toContain(collaborate.details);
  });
  it('renders a dismissible notification', () => {
    const wrapper = wrapped(
      <Notification
        type="information"
        notice={information.notice}
        details={information.details}
        dismissible={true}
      />
    );
    expect(wrapper.find('FontAwesome').length).toBe(2);
    expect(wrapper.find('FontAwesome').at(0).props().icon).toBe('info-circle');
    expect(wrapper.find('FontAwesome').at(1).props().icon).toBe('times');
  });
  it('renders a tooltip', () => {
    const wrapper = wrapped(
      <Notification
        type="information"
        notice={information.notice}
        details={information.details}
        dismissible={false}
        tooltipText={information.tooltip}
      />
    );
    expect(wrapper.find('FontAwesome').length).toBe(2);
    expect(wrapper.find('FontAwesome').at(0).props().icon).toBe('info-circle');
    expect(wrapper.find('FontAwesome').at(1).props().icon).toBe('info-circle');

    expect(wrapper.text()).toContain(information.notice);
    expect(wrapper.text()).toContain(information.details);
    expect(wrapper.text()).toContain(information.tooltip);
  });
});
