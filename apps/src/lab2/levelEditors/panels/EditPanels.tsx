import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {
  BodyThreeText,
  Heading3,
  Heading5,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import ImageInput from '@cdo/apps/levelbuilder/ImageInput';
import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel, PanelLayout} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';

import moduleStyles from './edit-panels.module.scss';

const createKey = (levelName: string) => levelName + '-' + createUuid();

function sanitizePanels(panels: Panel[], levelName: string) {
  return panels.map(panel => {
    return {
      ...panel,
      key: panel.key || createKey(levelName),
    };
  });
}

interface EditPanelsProps {
  initialPanels: Panel[];
  levelName: string;
}

/**
 * Editor for the Lab2 panels level type on the level edit page.
 */
const EditPanels: React.FunctionComponent<EditPanelsProps> = ({
  initialPanels,
  levelName,
}) => {
  const [panels, setPanels] = useState<Panel[]>(
    sanitizePanels(initialPanels, levelName)
  );
  const [toastMessage, setToastMessage] = useState('');
  const [toastIndex, setToastIndex] = useState(0);

  // Update a panel. Replaces a panel with the given key with the new panel.
  const updatePanel = useCallback(
    (panel: Panel) => {
      setPanels(panels.map(p => (p.key === panel.key ? panel : p)));
    },
    [panels]
  );

  const addPanel = useCallback(() => {
    setPanels([...panels, {text: '', imageUrl: '', key: createKey(levelName)}]);
  }, [panels, levelName]);

  const movePanel = useCallback(
    (key: string, direction: 'up' | 'down') => {
      const index = panels.findIndex(panel => {
        return panel.key === key;
      });

      if (index === -1) {
        return;
      }

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= panels.length) {
        return;
      }
      const newPanels = [...panels];
      const temp = newPanels[index];
      newPanels[index] = newPanels[newIndex];
      newPanels[newIndex] = temp;
      setPanels(newPanels);
    },
    [panels]
  );

  const deletePanel = useCallback(
    (key: string) => {
      setPanels(panels.filter(panel => panel.key !== key));
    },
    [panels]
  );

  const onContinue = useCallback((nextUrl?: string) => {
    if (nextUrl) {
      setToastMessage(`Redirecting to ${nextUrl}`);
    } else {
      setToastMessage('Navigating to next level');
    }
    // Force a refresh
    setToastIndex(t => t + 1);
  }, []);

  return (
    <div className={moduleStyles.container}>
      <input
        type="hidden"
        id="level_panels"
        name="level[panels]"
        value={JSON.stringify(panels)}
      />
      {/* This extra empty input is used to clear out any old panels data saved to the level's "level_data" field */}
      <input
        type="hidden"
        id="level_level_data"
        name="level[level_data]"
        value={JSON.stringify({})}
      />
      <Heading3>Preview</Heading3>
      <div className={moduleStyles.panelsContainer}>
        <Toast message={toastMessage} index={toastIndex} />
        <div className={moduleStyles.fullSizeContainer}>
          <PanelsView
            panels={panels}
            onContinue={onContinue}
            targetWidth={1920}
            targetHeight={1080}
            resetOnChange={false}
          />
        </div>
      </div>
      <div className={moduleStyles.panelEditors}>
        {panels.map((panel, index) => (
          <EditPanel
            key={panel.key}
            panel={panel}
            index={index}
            updatePanel={updatePanel}
            movePanel={movePanel}
            deletePanel={deletePanel}
            last={index === panels.length - 1}
          />
        ))}
      </div>
      <div className={moduleStyles.addButtonContainer}>
        <Button
          type="button"
          onClick={addPanel}
          text="Add Panel"
          color="gray"
          icon="plus"
        />
      </div>
    </div>
  );
};

interface EditPanelProps {
  panel: Panel;
  index: number;
  updatePanel: (panel: Panel) => void;
  movePanel: (key: string, direction: 'up' | 'down') => void;
  deletePanel: (key: string) => void;
  last?: boolean;
}

const EditPanel: React.FunctionComponent<EditPanelProps> = ({
  panel,
  index,
  updatePanel,
  movePanel,
  deletePanel,
  last = false,
}) => {
  return (
    <div className={moduleStyles.panelEditor}>
      <div className={moduleStyles.fieldRow}>
        <Heading5 className={moduleStyles.panelHeader}>
          Panel {index + 1}
        </Heading5>
        {index !== 0 && (
          <button
            type="button"
            className={moduleStyles.button}
            onClick={() => movePanel(panel.key, 'up')}
          >
            <FontAwesomeV6Icon iconName="arrow-up" />
          </button>
        )}
        {!last && (
          <button
            type="button"
            className={moduleStyles.button}
            onClick={() => movePanel(panel.key, 'down')}
          >
            <FontAwesomeV6Icon iconName="arrow-down" />
          </button>
        )}
        <button
          type="button"
          className={moduleStyles.deleteButton}
          onClick={() => deletePanel(panel.key)}
        >
          <FontAwesomeV6Icon iconName="trash" />
        </button>
      </div>
      <div className={moduleStyles.fieldRow}>
        <label htmlFor={panel.text}>Text</label>
        <textarea
          className={moduleStyles.textarea}
          name={panel.text}
          value={panel.text}
          onChange={e => updatePanel({...panel, text: e.target.value})}
        />
        <SimpleDropdown
          labelText="Position"
          name="position"
          size="s"
          onChange={e =>
            updatePanel({
              ...panel,
              layout: e.target.value as PanelLayout,
            })
          }
          selectedValue={panel.layout || 'text-top-right'}
          items={[
            {value: 'text-top-left', text: 'Top Left'},
            {value: 'text-top-right', text: 'Top Right'},
            {value: 'text-bottom-left', text: 'Bottom Left'},
            {value: 'text-bottom-right', text: 'Bottom Right'},
          ]}
        />
      </div>
      <div className={moduleStyles.fieldRow}>
        <ImageInput
          initialImageUrl={panel.imageUrl}
          updateImageUrl={imageUrl => {
            updatePanel({...panel, imageUrl: imageUrl});
          }}
        />
      </div>
      {last && (
        <div className={moduleStyles.fieldRow}>
          <label htmlFor={panel.nextUrl}>
            {'Redirect URL (leave blank to continue to next level)'}
          </label>
          <input
            name={panel.nextUrl}
            value={panel.nextUrl}
            onChange={e =>
              updatePanel({...panel, nextUrl: e.target.value || undefined})
            }
          />
        </div>
      )}
      <hr />
    </div>
  );
};

const Toast: React.FunctionComponent<{message: string; index: number}> = ({
  message,
  index,
}) => {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Use index to force a refresh
  useEffect(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    setShow(true);
    timeoutRef.current = window.setTimeout(() => setShow(false), 3000);
  }, [index]);

  return (
    <div className={moduleStyles.toastOverlay} key={index}>
      <div
        className={classNames(
          moduleStyles.toast,
          show && message && moduleStyles.toastShow
        )}
      >
        <BodyThreeText className={moduleStyles.toastMessage}>
          {message}
        </BodyThreeText>
      </div>
    </div>
  );
};

export default EditPanels;
