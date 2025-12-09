import {LinkButton} from '@code-dot-org/component-library/button';
import Image from '@code-dot-org/component-library/image';
import Link from '@code-dot-org/component-library/link';
import Tags from '@code-dot-org/component-library/tags';
import {
  BodyThreeText,
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {CourseOfferingFacilitatedWorkshop} from '@cdo/apps/templates/courseOfferings/types';
import findMoreWorkshopsIllustration from '@cdo/static/professional-learning/courses/find-more-workshops-illustration.svg';
import workshopsTeachWithConfidenceIllustration from '@cdo/static/professional-learning/courses/workshops-teach-with-confidence-illustration.svg';

import moduleStyles from './selfPacedPLCatalog.module.scss';

type SelfPacedPLCatalogCourseFacilitatedWorkshopsProps = {
  facilitated_workshops: CourseOfferingFacilitatedWorkshop[];
};

function formatDateString(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
}

const MAX_VISIBLE_WORKSHOPS = 2;

function formatWorkshopDate(sessions: {start: string}[]): string {
  if (!sessions.length) return '';
  const formatted = formatDateString(sessions[0].start);

  return sessions.length > 1
    ? `${formatted} +${sessions.length - 1}`
    : formatted;
}

function renderSessionsTooltip(sessions: {start: string}[]) {
  return (
    <>
      {sessions.map(({start}, i) => (
        <p key={i} style={{margin: 0}}>
          {formatDateString(start)}
          {i < sessions.length - 1 ? ',' : ''}
        </p>
      ))}
    </>
  );
}

const SelfPacedPLCatalogCourseFacilitatedWorkshops: React.FC<
  SelfPacedPLCatalogCourseFacilitatedWorkshopsProps
> = ({facilitated_workshops}) => {
  if (!facilitated_workshops.length) {
    return (
      <div className={moduleStyles.noFacilitatedWorkshopsCard}>
        <Image src={workshopsTeachWithConfidenceIllustration} />
        <div>
          <BodyThreeText noMargin>
            <StrongText>Teach with confidence</StrongText>
          </BodyThreeText>
          <BodyFourText noMargin>
            Experience Code.org’s curriculum firsthand in interactive workshops
            that prepare you to teach with confidence. Connect with fellow
            educators and leave ready to inspire your students!
          </BodyFourText>

          <Link
            href="/professional-learning/workshops"
            size="xs"
            openInNewTab
            external
            text="Explore workshop catalog"
          />
        </div>
      </div>
    );
  }

  const visibleFacilitatedWorkshops = facilitated_workshops.slice(
    0,
    MAX_VISIBLE_WORKSHOPS
  );

  return (
    <>
      {visibleFacilitatedWorkshops.map(
        ({id, link, title, sessions, is_virtual}) => (
          <div key={id} className={moduleStyles.facilitatedWorkshopCard}>
            <div>
              <BodyThreeText noMargin>
                <StrongText>{title}</StrongText>
              </BodyThreeText>
              <Tags
                className={moduleStyles.facilitatedWorkshopTags}
                size="s"
                tagsList={[
                  {
                    label: formatWorkshopDate(sessions),
                    tooltipId: `facilitated-workshop-tag-${id}-session`,
                    tooltipContent: renderSessionsTooltip(sessions),
                    icon: {iconName: 'calendar', placement: 'left'},
                  },
                  {
                    label: is_virtual ? 'VIRTUAL' : 'IN-PERSON',
                    tooltipContent: is_virtual
                      ? 'This workshop is virtual'
                      : 'This workshop is in-person',
                    tooltipId: `facilitated-workshop-tag-${id}-format`,
                    icon: {
                      iconName: is_virtual ? 'video-camera' : 'building',
                      placement: 'left',
                    },
                  },
                ]}
              />
            </div>

            <LinkButton
              size="xs"
              type="secondary"
              color="black"
              text="Learn more"
              href={link}
              className={moduleStyles.facilitatedWorkshopLearnMoreButton}
            />
          </div>
        )
      )}
      <div className={moduleStyles.findMoreWorkshopsCard}>
        <div>
          <BodyThreeText noMargin>
            Find more workshops on this topic and others.
          </BodyThreeText>
          <Link
            text="Find workshops"
            href="/professional-learning/workshops"
            size="s"
            external
            openInNewTab
          />
        </div>
        <div>
          <Image src={findMoreWorkshopsIllustration} />
        </div>
      </div>
    </>
  );
};

export default SelfPacedPLCatalogCourseFacilitatedWorkshops;
