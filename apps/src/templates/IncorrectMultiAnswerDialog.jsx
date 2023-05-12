import React, {useState} from 'react';
import StylizedBaseDialog, {
  FooterButton,
} from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import {BodyOneText} from '@cdo/apps/componentLibrary/typography';

export default function IncorrectMultiAnswerDialog() {
  const [isOpen, setIsOpen] = useState(true);

  const renderFooter = () => {
    return (
      <FooterButton
        text="Review"
        onClick={() => setIsOpen(false)}
        type="cancel"
      />
    );
  };

  return (
    <StylizedBaseDialog
      isOpen={isOpen}
      handleClose={() => setIsOpen(false)}
      renderFooter={renderFooter}
    >
      <BodyOneText style={{fontSize: 24}}>
        Sorry, that was incorrect.
      </BodyOneText>
    </StylizedBaseDialog>
  );
}
