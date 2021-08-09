import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import Notification from '@cdo/apps/templates/Notification';
import Button from '@cdo/apps/templates//Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

const announcement = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link:
    'http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the'
};

const announcementNoLink = {
  heading: 'Go beyond an Hour of Code',
  buttonText: 'Go Beyond',
  description:
    "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom."
};

const information = {
  notice: 'Did you know Clark Kent grew up in Kansas?',
  details:
    "Seriously, Kansas. Earth's greatest hero is from a tiny called Smallville, if you can believe it.",
  dismissible: true
};

const success = {
  notice: 'Wonder Woman Saved the Day',
  details:
    "Things were pretty sketchy there for awhile, but don't worry- she's on top of it.",
  dismissible: true
};

const failure = {
  notice: 'Lex Luthor Attacked Metropolis',
  details:
    "If you're in the Metropolis area, get to saftey as quickly as possible",
  dismissible: false
};

const warning = {
  notice: 'Batman is on Vacation in the Bahamas',
  details:
    'Now is probably not the best time to be in Gotham City. Watch your back.',
  dismissible: true
};

const findCourse = {
  notice: 'Find a course',
  details: 'Try new courses to add them to your homepage.',
  buttonText: 'Find a course',
  link: '/courses',
  dismissible: false
};

const firehoseAnalyticsData = {
  user_id: 1,
  important_data_point: 2
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
                  __useDeprecatedTag
                  href={announcement.link}
                  text={announcement.buttonText}
                  target="_blank"
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
                <Button
                  __useDeprecatedTag
                  href={findCourse.link}
                  text={findCourse.buttonText}
                  target="_blank"
                />
              </div>
            </div>
          </div>
          <div />
        </div>
      )
    );
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
    expect(wrapper.find('FontAwesome').length).to.equal(2);
    expect(
      wrapper
        .find('FontAwesome')
        .at(0)
        .props().icon
    ).to.equal('info-circle');
    expect(
      wrapper
        .find('FontAwesome')
        .at(1)
        .props().icon
    ).to.equal('times');
  });
});
