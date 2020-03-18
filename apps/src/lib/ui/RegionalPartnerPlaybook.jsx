import React, {Component} from 'react';

import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/ResourceCardResponsiveContainer';

const CARDS = [
  {
    title: 'Administrator and Counselor PD',
    description:
      '&bull; How-To Guide <br> &bull; Set Your Agenda<br> &bull; Logistics (Venue, Catering)<br> &bull; Supplies & Resources',
    link: '/educate/regional-partner/playbook/administrator'
  },

  {
    title: 'Advocacy',
    description:
      'Links to resources and websites to help you advocate for K-12 computer science policy in your state',
    link: '/educate/regional-partner/playbook/advocacy'
  },

  {
    title: 'Communications and Branding',
    description:
      '&bull; Weekly Update Email Archive<br> &bull; Code.org Comms to Teachers<br> &bull; Workshop & Email Comms.<br> &bull; Branding Guidelines',
    link: '/educate/regional-partner/playbook/communications'
  },

  {
    title: 'Community Building',
    description:
      '&bull; Resources & Ideas<br> &bull; Community Events for Teachers<br> &bull; CS Fair for Students',
    link: '/educate/regional-partner/playbook/community'
  },

  {
    title: 'Data',
    description:
      '&bull; Resources & Ideas<br> &bull; How to use the data dashboard',
    link: '/educate/regional-partner/playbook/data'
  },

  {
    title: 'Facilitator Support',
    description:
      '&bull; 1-Pager & Contract Exemplars <br> &bull; Facilitator Recruitment Resources <br> &bull; Facilitator Support Resources <br>  &bull; Facilitator Payments',
    link: '/educate/regional-partner/playbook/facilitator-support'
  },

  {
    title: 'Fundraising Resources',
    description:
      '&bull; Organization Sustainability <br> &bull; Fundraising Playbook',
    link: '/educate/regional-partner/playbook/funding'
  },

  {
    title: 'Ordering Supplies',
    description:
      '&bull; Accessing Mimeo <br> &bull; How to Order Supplies <br> &bull; Printable Certificates <br> &bull; Admin/Counselor Supplies ',
    link: '/educate/regional-partner/playbook/ordering-supplies'
  },

  {
    title: 'Regional Partner Network',
    description:
      'Access the Regional Partner Directory and learn more about the Advisory Committee',
    link: '/educate/regional-partner/playbook/directory'
  },

  {
    title: 'Payment Information',
    description:
      'Everything you need to know about how your organization will be compensated',
    link: '/educate/regional-partner/playbook/payments'
  },

  {
    title: 'Reporting and Evaluations',
    description:
      '&bull; Annual Report Requirements<br> &bull; Post Workshop Feedback Form<br> &bull; Regional Partner Annual Planning',
    link: '/educate/regional-partner/playbook/reporting-and-evaluations'
  },

  {
    title: 'District & School Recruitment',
    description:
      '&bull; How to recruit districts and schools<br/> &bull; Teacher applications',
    link: '/educate/regional-partner/playbook/teacher-recruitment'
  },

  {
    title: 'Teachers & Curriculum',
    description:
      '&bull; Info for Teacher Support<br> &bull; Links to Online Curriculum <br> &bull; Curriculum 1-pagers <br>',
    link: '/educate/regional-partner/playbook/curriculum'
  },

  {
    title: 'Timeline',
    description:
      'Visit this page for guidance on what to focus on and events being held each month',
    link: '/educate/regional-partner/playbook/timeline'
  },

  {
    title: 'Training Materials',
    description: 'Virtual trainings and past Regional Partner Summit resources',
    link: '/educate/regional-partner/playbook/training-materials'
  },

  {
    title: 'Workshops & Professional Learning',
    description: 'Everything you need to know to plan your workshops',
    link: '/educate/regional-partner/playbook/workshops-pl'
  },

  {
    title: 'FAQ',
    description: "Can't find what you're looking for? Check the FAQ",
    link: '/educate/regional-partner/playbook/faq'
  },

  {
    title: 'Legacy',
    description:
      "See information about Code.org's Legacy programs: ECS, CS in Algebra, CS in Science",
    link: '/educate/regional-partner/playbook/legacy'
  }
];

export default class RegionalPartnerPlaybook extends Component {
  render() {
    return (
      <ResourceCardResponsiveContainer>
        {CARDS.map((card, index) => (
          <ResourceCard
            {...card}
            // cards will not be reordered (or changed at all, for that
            // matter), so we're fine to use the index as the key
            key={index}
            buttonText="Learn More"
            allowWrap={true}
            allowMarkdown={true}
          />
        ))}
      </ResourceCardResponsiveContainer>
    );
  }
}
