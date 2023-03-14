import React, {Component} from 'react';
import HeaderBanner from '../HeaderBanner';
import {TwoColumnActionBlock} from '@cdo/apps/templates/studioHomepages/TwoColumnActionBlock';
import createPubSub from '@cdo/apps/lib/util/PubSubService';

class Incubator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      members: []
    };

    this.pubSub = createPubSub({
      usePusher: true,
      pusherApplicationKey: ''  // todo: pass this in from server
    });

    this.pubSubChannel = this.pubSub.subscribe('presence-incubator-page');
    this.pubSubChannel.subscribe(
      'pusher:subscription_succeeded',
      this.channelChanged
    );
    this.pubSubChannel.subscribe(
      'pusher:member_added',
      this.channelChanged
    );
    this.pubSubChannel.subscribe(
      'pusher:member_removed',
      this.channelChanged
    );
  }

  channelChanged = () => {
    // .pusherChannel_ shouldn't be necessary.
    //const members = this.pubSubChannel.pusherChannel_.members.members;
    const membersArray = [];
    this.pubSubChannel.pusherChannel_.members.each(member => membersArray.push(member.info.name));
    console.log(membersArray);
    this.setState({members: membersArray});
  };

  render() {
    return (
      <div>
        <HeaderBanner
          headingText="Incubator"
          subHeadingText="Try something new"
          backgroundUrl="/shared/images/banners/banner-incubator.png"
          imageUrl="/shared/images/banners/banner-incubator-image.png"
          short={true}
        />
        <div className="main" style={{maxWidth: 970, margin: '0 auto'}}>
          <div style={{margin: '40px 0'}}>
            <strong>
              Users currently on this page:
            </strong>
            {this.state.members.map(member => {
              return (
                <div key={member}>
                  {member}
                </div>
              )
            })}
            <div style={{height: 200}}>
              &nbsp;
            </div>
            <p>
              The Incubator is where you get to try out some of the latest ideas
              from inside Code.org.
            </p>
            <p>
              <strong>
                These are "works in progress", so some things are a bit
                different. Things change regularly, you might find things that
                need fixing, progress isn't always saved, and they might go away
                again.
              </strong>
            </p>
            <p>
              By using the Incubator, you can help us shape the future of
              computer science education. We would love to hear what you think.
            </p>
          </div>

          <TwoColumnActionBlock
            imageUrl={
              '/shared/images/teacher-announcement/incubator-projectbeats.png'
            }
            subHeading={'Project Beats'}
            description={
              'Make music with code! Try mixing and matching beats, bass, and other sounds to make your own songs.'
            }
            buttons={[
              {
                url: '/projectbeats',
                text: 'Try it out!'
              }
            ]}
          />
        </div>
      </div>
    );
  }
}

export default Incubator;
