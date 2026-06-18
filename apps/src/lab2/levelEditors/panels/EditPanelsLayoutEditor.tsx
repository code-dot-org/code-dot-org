import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useRef, useState} from 'react';

import localization from '@cdo/apps/localization';
import {
  DEFAULT_PANEL_IMAGE_WIDTH,
  DEFAULT_PANEL_IMAGE_X,
  DEFAULT_PANEL_IMAGE_Y,
  DEFAULT_PANEL_LINK_WIDTH,
  Panel,
} from '@cdo/apps/panels/types';

import moduleStyles from './edit-panels.module.scss';

type EditableElementType = 'image' | 'link';

interface EditableElement {
  type: EditableElementType;
  index: number;
}

interface DragState extends EditableElement {
  mode: 'move';
  offsetX: number;
  offsetY: number;
}

interface ResizeImageState {
  mode: 'resize-image';
  index: number;
  edgeOffsetX: number;
}

type InteractionState = DragState | ResizeImageState;

interface EditPanelsLayoutEditorProps {
  panel: Panel;
  updatePanel: (panel: Panel) => void;
}

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

const roundPercent = (value: number) => Math.round(clampPercent(value));

const isSameElement = (
  a: EditableElement | null,
  b: EditableElementType,
  index: number
) => a?.type === b && a.index === index;

const getPointerPercent = (
  event: React.PointerEvent,
  rect: DOMRect
): {x: number; y: number} => ({
  x: ((event.clientX - rect.left) / rect.width) * 100,
  y: ((event.clientY - rect.top) / rect.height) * 100,
});

const getImagePosition = (panel: Panel, imageIndex: number) => {
  const image = panel.images?.[imageIndex];
  return {
    x: image?.x ?? DEFAULT_PANEL_IMAGE_X,
    y: image?.y ?? DEFAULT_PANEL_IMAGE_Y,
  };
};

const getImageWidth = (panel: Panel, imageIndex: number) =>
  panel.images?.[imageIndex]?.width ?? DEFAULT_PANEL_IMAGE_WIDTH;

const getLinkPosition = (panel: Panel, linkIndex: number) => {
  const link = panel.links?.[linkIndex];
  return {
    x: link?.x ?? 0,
    y: link?.y ?? 0,
  };
};

// Drag surface for link-mode panels. It edits the same x/y percentage values
// used by the student view, so the saved level data stays backward compatible.
const EditPanelsLayoutEditor: React.FunctionComponent<
  EditPanelsLayoutEditorProps
> = ({panel, updatePanel}) => {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [interactionState, setInteractionState] =
    useState<InteractionState | null>(null);
  const [selectedElement, setSelectedElement] =
    useState<EditableElement | null>(null);

  const updateElementPosition = useCallback(
    (
      type: EditableElementType,
      index: number,
      nextX: number,
      nextY: number
    ) => {
      const x = roundPercent(nextX);
      const y = roundPercent(nextY);

      if (type === 'image') {
        const images = panel.images || [];
        const image = images[index];
        if (!image) {
          return;
        }

        const nextImages = [...images];
        nextImages[index] = {...image, x, y};
        updatePanel({...panel, images: nextImages});
        return;
      }

      const links = panel.links || [];
      const link = links[index];
      if (!link) {
        return;
      }

      const nextLinks = [...links];
      nextLinks[index] = {...link, x, y};
      updatePanel({...panel, links: nextLinks});
    },
    [panel, updatePanel]
  );

  const updateImageWidth = useCallback(
    (imageIndex: number, nextWidth: number) => {
      const images = panel.images || [];
      const image = images[imageIndex];
      if (!image) {
        return;
      }

      const newImages = [...images];
      newImages[imageIndex] = {
        ...image,
        width: Math.max(roundPercent(nextWidth), 1),
      };
      updatePanel({...panel, images: newImages});
    },
    [panel, updatePanel]
  );

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    type: EditableElementType,
    index: number,
    x: number,
    y: number
  ) => {
    if (event.button > 0) {
      return;
    }

    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const pointer = getPointerPercent(event, rect);
    setSelectedElement({type, index});
    setInteractionState({
      mode: 'move',
      type,
      index,
      offsetX: pointer.x - x,
      offsetY: pointer.y - y,
    });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const startResizeImage = (
    event: React.PointerEvent<HTMLElement>,
    imageIndex: number,
    x: number,
    width: number
  ) => {
    if (event.button > 0) {
      return;
    }

    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const pointer = getPointerPercent(event, rect);
    setSelectedElement({type: 'image', index: imageIndex});
    setInteractionState({
      mode: 'resize-image',
      index: imageIndex,
      edgeOffsetX: pointer.x - (x + width / 2),
    });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!interactionState || !rect) {
      return;
    }

    const pointer = getPointerPercent(event, rect);
    if (interactionState.mode === 'resize-image') {
      const {x} = getImagePosition(panel, interactionState.index);
      updateImageWidth(
        interactionState.index,
        (pointer.x - interactionState.edgeOffsetX - x) * 2
      );
    } else {
      updateElementPosition(
        interactionState.type,
        interactionState.index,
        pointer.x - interactionState.offsetX,
        pointer.y - interactionState.offsetY
      );
    }
  };

  const stopDrag = () => {
    setInteractionState(null);
  };

  const handleResizeKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    imageIndex: number,
    width: number
  ) => {
    const step = event.shiftKey ? 5 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      setSelectedElement({type: 'image', index: imageIndex});
      updateImageWidth(imageIndex, width - step);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      setSelectedElement({type: 'image', index: imageIndex});
      updateImageWidth(imageIndex, width + step);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    type: EditableElementType,
    index: number,
    x: number,
    y: number
  ) => {
    const step = event.shiftKey ? 5 : 1;
    let nextX = x;
    let nextY = y;

    if (event.key === 'ArrowLeft') {
      nextX -= step;
    } else if (event.key === 'ArrowRight') {
      nextX += step;
    } else if (event.key === 'ArrowUp') {
      nextY -= step;
    } else if (event.key === 'ArrowDown') {
      nextY += step;
    } else {
      return;
    }

    event.preventDefault();
    setSelectedElement({type, index});
    updateElementPosition(type, index, nextX, nextY);
  };

  const backgroundImage = panel.imageUrl
    ? `url("${localization.translate(panel.imageUrl, ['lz-image'])}")`
    : undefined;

  return (
    <div className={moduleStyles.layoutSection}>
      <Typography variant="h6" gutterBottom>
        Layout
      </Typography>
      <div
        ref={surfaceRef}
        role="region"
        aria-label="Panel layout editor"
        className={moduleStyles.layoutSurface}
        style={{backgroundImage}}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        {panel.images
          ?.slice()
          .reverse()
          .map((image, reverseIndex) => {
            const imageIndex = (panel.images?.length || 0) - reverseIndex - 1;
            const {x, y} = getImagePosition(panel, imageIndex);
            const width = getImageWidth(panel, imageIndex);

            return (
              <div
                key={`image-${imageIndex}`}
                role="button"
                tabIndex={0}
                aria-label={`Image ${imageIndex + 1}`}
                className={classNames(
                  moduleStyles.layoutElement,
                  moduleStyles.layoutImageElement,
                  isSameElement(selectedElement, 'image', imageIndex) &&
                    moduleStyles.layoutElementSelected
                )}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                }}
                onPointerDown={event =>
                  startDrag(event, 'image', imageIndex, x, y)
                }
                onKeyDown={event =>
                  handleKeyDown(event, 'image', imageIndex, x, y)
                }
              >
                {image.imageUrl ? (
                  <img
                    src={localization.translate(image.imageUrl, ['lz-image'])}
                    alt=""
                    draggable={false}
                  />
                ) : (
                  <span className={moduleStyles.layoutImagePlaceholder}>
                    <FontAwesomeV6Icon iconName="image" />
                    Image {imageIndex + 1}
                  </span>
                )}
                {image.targetKey && (
                  <span className={moduleStyles.layoutLinkBadge}>
                    <FontAwesomeV6Icon iconName="link" />
                  </span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Resize image ${imageIndex + 1}`}
                  title="Drag to resize"
                  className={moduleStyles.layoutResizeHandle}
                  onPointerDown={event =>
                    startResizeImage(event, imageIndex, x, width)
                  }
                  onKeyDown={event =>
                    handleResizeKeyDown(event, imageIndex, width)
                  }
                />
              </div>
            );
          })}
        {panel.links?.map((link, linkIndex) => {
          const {x, y} = getLinkPosition(panel, linkIndex);
          return (
            <div
              key={`link-${linkIndex}`}
              role="button"
              tabIndex={0}
              aria-label={`Text ${linkIndex + 1}`}
              className={classNames(
                moduleStyles.layoutElement,
                moduleStyles.layoutTextElement,
                panel.dark && moduleStyles.layoutTextElementDark,
                isSameElement(selectedElement, 'link', linkIndex) &&
                  moduleStyles.layoutElementSelected
              )}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${link.width ?? DEFAULT_PANEL_LINK_WIDTH}%`,
              }}
              onPointerDown={event => startDrag(event, 'link', linkIndex, x, y)}
              onKeyDown={event => handleKeyDown(event, 'link', linkIndex, x, y)}
            >
              <span className={moduleStyles.layoutTextContent}>
                {link.text || `Text ${linkIndex + 1}`}
              </span>
              {link.targetKey && (
                <span className={moduleStyles.layoutLinkBadge}>
                  <FontAwesomeV6Icon iconName="link" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditPanelsLayoutEditor;
