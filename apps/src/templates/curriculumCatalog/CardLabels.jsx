import {OverlayTrigger, Tooltip} from 'react-bootstrap-2';
import React from 'react';
import style from '@cdo/apps/templates/curriculumCatalog/curriculum_catalog_card.module.scss';
import PropTypes from 'prop-types';

// The arrowProps passed down in ReactBootstrap use styles that
// conflict with the custom styles that we want, so they
// are extracted out here.
const LabelTooltip = React.forwardRef(
  (
    {arrowProps, ...props}, // eslint-disable-line react/prop-types
    ref
  ) => <Tooltip ref={ref} {...props} />
);

// Allow the tooltips to display on focus so that the information
// can be shown via keyboard
const LabelOverlayTrigger = props => (
  <OverlayTrigger placement="top" trigger={['hover', 'focus']} {...props} />
);

const CardLabels = ({subjectsAndTopics}) => (
  <>
    {subjectsAndTopics.length > 0 && (
      <LabelOverlayTrigger
        overlay={props => (
          <LabelTooltip
            id="first-label-tooltip"
            className={style.labelTooltip}
            {...props}
          >
            {subjectsAndTopics[0]}
          </LabelTooltip>
        )}
      >
        <div tabIndex="0" role="tooltip">
          {subjectsAndTopics[0]}
        </div>
      </LabelOverlayTrigger>
    )}
    {subjectsAndTopics.length > 1 && (
      <LabelOverlayTrigger
        overlay={props => (
          <LabelTooltip
            id="remaining-labels-tooltip"
            className={style.labelTooltip}
            {...props}
          >
            {subjectsAndTopics.slice(1).map(label => (
              <p key={label}>{label}</p>
            ))}
          </LabelTooltip>
        )}
      >
        <div
          tabIndex="0"
          role="tooltip"
          aria-label={subjectsAndTopics.slice(1).join(', ')}
        >{`+${subjectsAndTopics.length - 1}`}</div>
      </LabelOverlayTrigger>
    )}
  </>
);

CardLabels.propTypes = {
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string),
};

export default CardLabels;
