import Checkbox from '@code-dot-org/component-library/checkbox';
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import ImageInput from '@cdo/apps/levelbuilder/ImageInput';
import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel, PanelLayout} from '@cdo/apps/panels/types';
import {createUuid} from '@cdo/apps/utils';

import EditPanelsLinks from './EditPanelsLinks';

import moduleStyles from './edit-panels.module.scss';

const createKey = (levelName: string) => levelName + '-' + createUuid();

const PANEL_WIDTH = 1920;
const PANEL_HEIGHT = 1080;

// Fraction of viewport width occupied by the pinned preview. Paired with
// `width: Nvw` in edit-panels.module.scss via `:export`.
const PINNED_WIDTH_VIEWPORT_FRACTION =
  parseFloat(moduleStyles.pinnedWidthVw) / 100;

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
  initialUseLinks?: boolean;
  levelName: string;
}

/**
 * Editor for the Lab2 panels level type on the level edit page.
 */
const EditPanels: React.FunctionComponent<EditPanelsProps> = ({
  initialPanels,
  initialUseLinks = false,
  levelName,
}) => {
  const [panels, setPanels] = useState<Panel[]>(
    sanitizePanels(initialPanels, levelName)
  );
  const [useLinks, setUseLinks] = useState<boolean>(initialUseLinks);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIndex, setToastIndex] = useState(0);
  const [pinPreview, setPinPreview] = useState(false);
  const [pinnedScale, setPinnedScale] = useState(0.5);
  const previewSlotRef = useRef<HTMLDivElement | null>(null);

  // Pin the preview once its reserved slot scrolls above the viewport.
  // `position: sticky` is unreliable here due to ancestor flex and Bootstrap
  // collapse wrappers, so a scroll listener drives it instead. The same
  // listener updates pinnedScale so the 1920x1080 inner surface fits the
  // shrunk outer box across viewport resizes.
  useEffect(() => {
    const onScroll = () => {
      const slot = previewSlotRef.current;
      if (!slot) return;
      // Unpin once the whole editor is above the viewport.
      const editor = document.getElementById('panels-editor');
      const editorOffscreen =
        !!editor && editor.getBoundingClientRect().bottom <= 0;
      setPinPreview(slot.getBoundingClientRect().top <= 0 && !editorOffscreen);
      setPinnedScale(
        (window.innerWidth * PINNED_WIDTH_VIEWPORT_FRACTION) / PANEL_WIDTH
      );
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Update a panel. Replaces a panel with the given key with the new panel.
  const updatePanel = useCallback(
    (panel: Panel) => {
      setPanels(panels.map(p => (p.key === panel.key ? panel : p)));
    },
    [panels]
  );

  const createNewPanel = useCallback(
    () => ({
      text: '',
      imageUrl: '',
      key: createKey(levelName),
    }),
    [levelName]
  );

  const prependPanel = useCallback(() => {
    setPanels([createNewPanel(), ...panels]);
  }, [panels, createNewPanel]);

  const appendPanel = useCallback(() => {
    setPanels([...panels, createNewPanel()]);
  }, [panels, createNewPanel]);

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
      <input
        type="hidden"
        id="level_use_links"
        name="level[use_links]"
        value={useLinks ? 'true' : 'false'}
      />
      <Typography variant="h3" gutterBottom>
        Preview
      </Typography>
      <div ref={previewSlotRef} className={moduleStyles.panelsSlot}>
        <div
          className={classNames(
            moduleStyles.panelsContainer,
            pinPreview && moduleStyles.panelsContainerPinned
          )}
          style={
            pinPreview
              ? ({'--pinned-scale': pinnedScale} as React.CSSProperties)
              : undefined
          }
        >
          <Toast message={toastMessage} index={toastIndex} />
          <div className={moduleStyles.fullSizeContainer}>
            <ThemeProvider>
              <PanelsView
                panels={panels}
                onContinue={onContinue}
                targetWidth={PANEL_WIDTH}
                targetHeight={PANEL_HEIGHT}
                offerBrowserTts={false}
                resetOnChange={false}
                levelId={null}
                useLinks={useLinks}
              />
            </ThemeProvider>
          </div>
        </div>
      </div>
      <div className={moduleStyles.fieldRow}>
        <ThemeProvider>
          <Checkbox
            checked={useLinks}
            name="use_links"
            label="Use links for navigation"
            size="s"
            onChange={event => setUseLinks(event.target.checked)}
          />
        </ThemeProvider>
      </div>
      {panels.length > 0 && (
        <div className={moduleStyles.addButtonContainer}>
          <Button
            type="button"
            onClick={prependPanel}
            text="Add Panel"
            color="gray"
            icon="plus"
          />
        </div>
      )}
      <div className={moduleStyles.panelEditors}>
        {panels.map((panel, index) => (
          <EditPanel
            key={panel.key}
            panel={panel}
            index={index}
            allPanels={panels}
            useLinks={useLinks}
            updatePanel={updatePanel}
            movePanel={movePanel}
            deletePanel={deletePanel}
            last={index === panels.length - 1}
            // Slides feature: only surface the teacher-note input when at
            // least one panel already carries a note. That keeps regular
            // panels-level edit pages visually unchanged while still
            // letting the slides editor (whose AI fills teacherNote on
            // every panel) edit them in place. New panels appended
            // afterward pick up the field too, since they share the same
            // panels[] state.
            showTeacherNotes={panels.some(
              p => p.teacherNote && p.teacherNote.trim()
            )}
          />
        ))}
      </div>
      <div className={moduleStyles.addButtonContainer}>
        <Button
          type="button"
          onClick={appendPanel}
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
  allPanels: Panel[];
  useLinks: boolean;
  updatePanel: (panel: Panel) => void;
  movePanel: (key: string, direction: 'up' | 'down') => void;
  deletePanel: (key: string) => void;
  last?: boolean;
  // True when any panel in this set has a teacherNote. The textarea
  // renders for every panel in that case (even ones with empty notes,
  // so the user can fill them in); false hides it everywhere so regular
  // panels levels don't grow a new field.
  showTeacherNotes?: boolean;
}

const EditPanel: React.FunctionComponent<EditPanelProps> = ({
  panel,
  index,
  allPanels,
  useLinks,
  updatePanel,
  movePanel,
  deletePanel,
  last = false,
  showTeacherNotes = false,
}) => {
  return (
    <div className={moduleStyles.panelEditor}>
      <div className={moduleStyles.fieldRow}>
        <Typography
          className={moduleStyles.panelHeader}
          variant="h5"
          gutterBottom
        >
          Panel {index + 1}
        </Typography>
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
            {value: 'text-top-center', text: 'Top Center'},
            {value: 'text-top-right', text: 'Top Right'},
            {value: 'text-bottom-left', text: 'Bottom Left'},
            {value: 'text-bottom-center', text: 'Bottom Center'},
            {value: 'text-bottom-right', text: 'Bottom Right'},
          ]}
        />
      </div>
      <div className={moduleStyles.fieldRow}>
        <ImageInput
          initialImageUrl={panel.imageUrl}
          updateImageUrl={(imageUrl: string) => {
            updatePanel({...panel, imageUrl: imageUrl});
          }}
          dimensions={{width: PANEL_WIDTH, height: PANEL_HEIGHT}}
          fileTypes={['GIF', 'JPG', 'PNG']}
        />
      </div>
      {showTeacherNotes && (
        <div className={moduleStyles.fieldRow}>
          <label htmlFor={`teacher-note-${panel.key}`}>
            Teacher note (shown only to teachers, below the panel bubbles)
          </label>
          <textarea
            id={`teacher-note-${panel.key}`}
            className={moduleStyles.textarea}
            value={panel.teacherNote || ''}
            onChange={e => updatePanel({...panel, teacherNote: e.target.value})}
          />
        </div>
      )}
      <div className={moduleStyles.fieldRow}>
        <Checkbox
          checked={!!panel.typing}
          name="typing"
          label="Typing? (No markdown support)"
          size="s"
          onChange={event =>
            updatePanel({
              ...panel,
              typing: event.target.checked,
            })
          }
        />
      </div>
      <div className={moduleStyles.fieldRow}>
        <Checkbox
          checked={!!panel.fadeInOverPrevious}
          name="fadeInOverPrevious"
          label="Fade in over previous"
          size="s"
          onChange={event =>
            updatePanel({
              ...panel,
              fadeInOverPrevious: event.target.checked,
            })
          }
        />
      </div>
      {useLinks && (
        <div className={moduleStyles.fieldRow}>
          <Checkbox
            checked={!!panel.showContinueButton}
            name="showContinueButton"
            label="Show Continue button on this panel"
            size="s"
            onChange={event =>
              updatePanel({
                ...panel,
                showContinueButton: event.target.checked,
              })
            }
          />
        </div>
      )}
      {useLinks && (
        <EditPanelsLinks
          panel={panel}
          allPanels={allPanels}
          updatePanel={updatePanel}
        />
      )}
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
        <Typography
          className={moduleStyles.toastMessage}
          variant="body3"
          gutterBottom
        >
          {message}
        </Typography>
      </div>
    </div>
  );
};

export default EditPanels;
