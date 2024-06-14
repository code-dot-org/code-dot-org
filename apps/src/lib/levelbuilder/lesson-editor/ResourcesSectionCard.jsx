import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import OrderControls from '../OrderControls';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/componentLibrary/button/Button';
import AddResourceDialog from './AddResourceDialog';

export default function ResourcesSectionCard({
  resource,
  handleRemoveResource,
  courseVersionId,
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditResourceDialogOpen = () => setEditDialogOpen(true);
  const handleNewResourceDialogClose = () => setEditDialogOpen(false);

  // TODO: Make dlete and move buttons work
  // TODO: Generally fix color
  // TODO: Get edit dialog to work
  return (
    <div
      style={{background: 'rgb(217, 239, 247', padding: '15px', margin: '10px'}}
    >
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading3>{'Resource name: ' + resource.name}</Heading3>
        <div style={{display: 'flex'}}>
          <Button
            text={'Edit'}
            icon="plus"
            onClick={handleEditResourceDialogOpen}
          />
          <OrderControls
            name={resource.name}
            move={() => console.log('this was moved')}
            remove={handleRemoveResource}
            item={resource}
            itemType={'resource'}
          />
        </div>
      </div>
      <div>
        <div style={{display: 'flex', gap: '30px'}}>
          <BodyTwoText>
            <strong>Key: </strong>
            {resource.key}
          </BodyTwoText>
          <BodyTwoText>
            <strong>Type: </strong>
            {resource.type}
          </BodyTwoText>
          <BodyTwoText>
            <strong>Audience: </strong>
            {resource.audience}
          </BodyTwoText>
        </div>
        <div>
          <BodyTwoText>
            <strong>URL: </strong>
            {resource.url}
          </BodyTwoText>
        </div>
      </div>
      <AddResourceDialog
        isOpen={editDialogOpen}
        onSave={() => 'pretend to save'}
        handleClose={handleNewResourceDialogClose}
        existingResource={resource}
        courseVersionId={courseVersionId}
      />
    </div>
  );
}

ResourcesSectionCard.propTypes = {
  resource: resourceShape,
  handleRemoveResource: PropTypes.func,
  courseVersionId: PropTypes.number,
};
