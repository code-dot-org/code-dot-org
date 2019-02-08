import React, {Component} from 'react';

import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import ResourceCardResponsiveContainer from '@cdo/apps/templates/studioHomepages/ResourceCardResponsiveContainer';

const CARDS = [
  {
    title: 'Administrator and Counselor PD',
    description:
      '* How-To Guide <br> * Set Your Agenda<br> * Logistics (Venue, Catering)<br> * Supplies & Resources',
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
      '* Weekly Update Email Archive<br> * Code.org Comms to Teachers<br> * Workshop & Email Comms.<br> * Branding Guidelines',
    link: '/educate/regional-partner/playbook/communications'
  },

  {
    title: 'Community Building',
    description:
      '* Resources & Ideas<br> * Community Events for Teachers<br> * CS Fair for Students',
    link: '/educate/regional-partner/playbook/community'
  },

  {
    title: 'Data',
    description: '* Resources & Ideas<br> * How to use the data dashboard',
    link: '/educate/regional-partner/playbook/data'
  },

  {
    title: 'Facilitator Support',
    description:
      '* 1-Pager & Contract Exemplars <br> * Facilitator Recruitment Resources <br> * Facilitator Support Resources <br>  * Facilitator Payments',
    link: '/educate/regional-partner/playbook/facilitator-support'
  },

  {
    title: 'Fundraising Resources',
    description: '* Organization Sustainability <br> * Fundraising Playbook',
    link: '/educate/regional-partner/playbook/funding'
  },

  {
    title: 'Ordering Supplies',
    description:
      '* Accessing Mimeo <br> * How to Order Supplies <br> * Printable Certificates <br> * Admin/Counselor Supplies ',
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
      '* Annual Report Requirements<br> * Post Workshop Feedback Form<br> * Regional Partner Annual Planning',
    link: '/educate/regional-partner/playbook/reporting-and-evaluations'
  },

  {
    title: 'Teacher & District Recruitment',
    description:
      '* How to recruit teachers and districts<br/> * Teacher applications',
    link: '/educate/regional-partner/playbook/teacher-recruitment'
  },

  {
    title: 'Teachers & Curriculum',
    description:
      '* Info for Teacher Support<br> * Links to Online Curriculum <br> * Curriculum 1-pagers <br>',
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
        {CARDS.map(card => (
          <ResourceCard
            {...card}
            buttonText="Learn More"
            allowWrap={true}
            allowDangerouslySetInnerHtml={true}
          />
        ))}
      </ResourceCardResponsiveContainer>
    );
  }
}
