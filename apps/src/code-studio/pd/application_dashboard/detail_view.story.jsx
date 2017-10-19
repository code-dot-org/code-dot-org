import React from 'react';
import {DetailViewContents} from './detail_view';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('DetailViewContents', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Detail view for applications',
        story: () => (
          <DetailViewContents
            applicationData={{
              name: 'Rubeus Hagrid',
              totalScore: 42,
              acceptance: 'accepted',
              title: 'Groundskeeper',
              accountEmail: 'hagrid@hogwarts.edu',
              phone: '867-5309',
              district: 'Ministry of Magic Department of Education',
              school: 'Hogwarts',
              course: 'CS Principles',
              regionalPartner: 'Order of the Phoenix',
              program: 'Advanced Expelliarmus',
              planToTeachThisYear: 'Yes',
              rateAbility: '6',
              canAttendFIT: 'Yes',
              responsesForSections: [{
                sectionName: 'Keeping Students Safe',
                responses: [{
                  question: (
                    <div>
                      Do you believe that dangerous creatures like <i>Acromantulas</i> should be kept away from students?
                    </div>
                  ),
                  answer: 'Now wait der justa minute - Aragog would never hurt a fly! Misunderstood, thats all',
                  score: 1
                }, {
                  question: (
                    <div>
                      Are giants dangerous?
                    </div>
                  ),
                  answer: 'No! Grawp is as gentle as can be, just needs a firm hand every now and then is all',
                  score: 1
                }]
              }, {
                sectionName: 'Equipment',
                responses: [{
                  question: (
                    <div>
                      Describe your wand
                    </div>
                  ),
                  answer: 'Well, yer see, it looks like kind of an umbrella sorta thing'
                }]
              }],
              notes: 'Will require a large bed'
            }}
          />
        )
      }
    ]);
};
