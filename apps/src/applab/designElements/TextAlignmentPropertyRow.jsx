import React from 'react';
import PropTypes from 'prop-types';
import applabMsg from '@cdo/applab/locale';
import EnumPropertyRow from './EnumPropertyRow';

export const TEXT_ALIGNMENT_LEFT = 'left';
export const TEXT_ALIGNMENT_RIGHT = 'right';
export const TEXT_ALIGNMENT_CENTER = 'center';
export const TEXT_ALIGNMENT_JUSTIFY = 'justify';

const TEXT_ALIGNMENTS = [
  TEXT_ALIGNMENT_LEFT,
  TEXT_ALIGNMENT_RIGHT,
  TEXT_ALIGNMENT_CENTER,
  TEXT_ALIGNMENT_JUSTIFY,
];

export default function TextAlignmentPropertyRow(props) {
  return (
    <EnumPropertyRow
      desc={applabMsg.designElementProperty_textAlignment()}
      initialValue={props.initialValue}
      options={TEXT_ALIGNMENTS}
      displayOptions={TEXT_ALIGNMENTS.map(textAlignment =>
        applabMsg[`designElementProperty_textAlignment_${textAlignment}`]()
      )}
      handleChange={props.handleChange}
    />
  );
}

TextAlignmentPropertyRow.propTypes = {
  initialValue: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
};
