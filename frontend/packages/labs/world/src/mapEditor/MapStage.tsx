// The map canvas, and the inspector beside it.
//
// Everything about arranging actors in a world: the camera, the drawing, the
// gestures, and the panel that edits the selected placement's properties.
// Everything EXCEPT which actors may be placed and where the document comes
// from, because those are the caller's: `MapEditor` holds a file — a `.map`,
// or a world with its main map — and offers a palette of every actor
// template.
//
// So this takes the placements it may edit, the placements it may only draw,
// and the type a click places. It knows nothing about files, blocks, or where
// the thumbnails came from.
//
// Nor does it do arithmetic. Which actor is under a point, where a dropped
// one lands, whether the camera has to move — every answer that is a number
// comes from `stageGeometry`, which has no canvas in it and is tested as such.
// What is left here is drawing, gesture and state.

import {
  Button,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {useEffect, useRef, useState} from 'react';

import Accordion from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';

import type {EventChoice} from '../blockly/eventChoices';
import {placementKey} from '../blockly/mapPlacements';
import {setRevealer} from '../callouts/reveal';
import {ANCHORS} from '../engine';
import {STYLED} from '../engine/rules/styled';
import {VIEWPORT} from '../engine/rules/viewport';
import fields from '../formFields.module.css';
import type {Affordance} from '../progression/types';
import type {ActorSchema, PropertySchema} from '../runtime/messages';
import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../runtime/viewport';
import {IMPORT_STYLE_VALUE, requestStyleImport} from '../styles/styleImport';

import {AngleInput} from './AngleInput';
import {CameraInspector} from './CameraInspector';
import {CameraPanel} from './CameraPanel';
import {IconAction} from './IconAction';
import {LayerInspector} from './LayerInspector';
import {LayerPanel} from './LayerPanel';
import styles from './mapEditor.module.css';
import {MapInspector} from './MapInspector';
import {
  addPlacementCamera,
  removePlacementCamera,
  renamePlacementCamera,
  showsThroughOf,
  withPlacementCameraTrait,
  withPlacementCameraValue,
  withShowsThrough,
  asVec,
  extentOf,
  positionOf,
  chosenActors,
  linksFrom,
  placementChoices,
  propValue,
  withPicked,
  withProperty,
  type MapDoc,
  type Placement,
  type Transform,
  type Size,
  type Vec,
  type View,
  addLayer,
  asNum,
  DEFAULT_LAYER,
  hasScript,
  layerName,
  layerOfPlacement,
  layersOf,
  moveLayer,
  parentIdOf,
  removeLayer,
  renamePlacementReferences,
  withoutPlacement,
  withLayer,
  withPlacementAnchor,
  withPlacementLayer,
  withBackground,
  withEventHandler,
  type MapSlotDoc,
  toLocalPosition,
  withParent,
  worldTransformOf,
} from './mapModel';
import {RecordPanel} from './RecordPanel';
import {
  angleTo,
  handlePoint,
  normalizeRotation,
  RESIZE_HANDLES,
  resizeBox,
  rotationPoint,
  type Box,
  type ResizeHandle,
} from './rotatedResize';
import {
  DRAW_SIZE,
  drawnSize,
  fitView,
  hitTest,
  nextSelection,
  panIntoView,
  type Remembered,
  rememberedPicture,
  screenToWorld as toWorld,
  scriptButtonAt,
  worldToScreen,
  snapPoint,
  snapToTile,
  steppedBy,
  zoomToward,
} from './stageGeometry';
import {useAfterImport} from './useAfterImport';
import {VectorInput} from './VectorInput';
import {WithheldNote} from './WithheldNote';
import {MAIN_CAMERA, type CameraProperty} from './worldCameraCode';
import {placementCameras, type DeclaredCamera} from './worldCameras';
import {WorldInspector, type WorldInspectorProps} from './WorldInspector';
import type {CameraTraitChoice} from './worldRuleProperties';

/** What the stage can blit: a decoded thumbnail, or a canvas painted here. */
type Picture = HTMLImageElement | HTMLCanvasElement;

/**
 * Who owns `width` and `height` — the `Has a Box` trait, not any one kind.
 *
 * Nine interface actors mean the same thing by a box, so the editor asks one
 * owner about all of them instead of knowing which kind is which
 * (specs/BOXES_PLAN.md).
 */
const BOX_OWNER = 'hasABox';
/** Small enough to grab again, which is the only floor a box needs. */
const MIN_BOX = 8;
/** How far a keyboard step resizes by, and turns by. */
const RESIZE_STEP = 8;
const TURN_STEP = 15;
/** How big a grip is drawn and grabbed, in SCREEN pixels at any zoom. */
const HANDLE_SIZE = 9;
/**
 * The floating Code button's size, for keeping it inside the stage, and how
 * far it stands off the selection's corner — clear of the corner grip, which
 * reaches half a `HANDLE_SIZE` out from it.
 */
const SCRIPT_BUTTON = {w: 24, h: 24};
const SCRIPT_BUTTON_GAP = 10;
/** How far beyond the top edge the turn grip sits, in screen pixels. */
const TURN_REACH = 22;

const OUTSIDE_BG = '#0b0b12'; // the space beyond the map
const MAP_BG = '#151521'; // the map region itself
const GRID = 'rgba(255, 255, 255, 0.07)';
const BORDER = 'rgba(255, 255, 255, 0.6)'; // outlines the placeable map space
// Dashed: the part of a bigger map the game's fixed viewport actually shows.
const VIEWPORT_EDGE = 'rgba(255, 214, 102, 0.75)';
const SELECT = '#4d9fff'; // highlights the selected placed actor
const HOVER = 'rgba(77, 159, 255, 0.45)'; // lighter outline for the hovered actor
// …and a third, for an actor the selected one POINTS AT. Amber rather than a
// paler blue: it is not a weaker selection, it is a different relationship, and
// two shades of one color would read as two strengths of the same thing.
const REFERENCE = '#ffb454';
/** The corner mark on a placement whose workspace holds blocks. */
const SCRIPT = '#7c4dff';
const DEG2RAD = Math.PI / 180;

/**
 * The window a map is seen through when the world says nothing — one object,
 * shared. A default written inline is a new object on every render, and the
 * draw effect lists the window among its dependencies, so the stage was
 * repainting on every render of its inspector for a value that never changed.
 */
const STANDARD_WINDOW: Size = {w: VIEWPORT_WIDTH, h: VIEWPORT_HEIGHT};

export interface MapStageProps {
  /** The document this stage edits: its grid, and the placements it owns. */
  doc: MapDoc;
  /** Write back — every commit, so the caller decides what persisting means. */
  onDocChange: (next: MapDoc) => void;
  /**
   * The document as it is being edited, before it is committed — a field
   * half-typed. So a picture of the placement under edit can be asked for
   * while the typing goes on, rather than only once the field is left.
   */
  onDocPreview?: (next: MapDoc) => void;
  /** The actor type a click places; null is select mode. */
  placing: string | null;
  /** Sandbox-rendered thumbnails by type — what an actor is drawn as. */
  thumbnails: Record<string, string>;
  /**
   * Pictures painted in this window from the actor files, by placement key
   * or kind (`localPictures`). Preferred over a thumbnail for the same key:
   * the caller passes only the ones that should win.
   */
  pictures?: Record<string, HTMLCanvasElement>;
  /** Editable property schemas by type — what the inspector offers. */
  schemas: Record<string, ActorSchema>;
  /**
   * The project's themes as `[label, path]` — what a placement's `theme`
   * property offers instead of a text box (specs/STYLES_PLAN.md).
   */
  themeOptions?: ReadonlyArray<readonly [string, string]>;
  /**
   * How big each kind is in the world, for the kinds that declare a picture.
   *
   * Absent for a sprite-backed one, which falls back to the nominal tile — see
   * `ThumbnailsReadyMessage.sizes`.
   */
  sizes?: Record<string, {width: number; height: number}>;
  /**
   * How big particular PLACEMENTS are, by `placementKey`, for the ones that
   * override anything — since what they override may be their width and
   * height (`ThumbnailsReadyMessage.placementSizes`).
   */
  placementSizes?: Record<string, {width: number; height: number}>;
  /**
   * What each kind scales itself by, for the kinds that say.
   *
   * The default a placement's own `positional.scale` falls back to: a
   * placement stores only what it OVERRIDES, so an actor whose file says `set
   * scale of this to x 1 y 2` has nothing here and was drawn as though it had
   * never been scaled (`ThumbnailsReadyMessage.scales`).
   */
  scales?: Record<string, {x: number; y: number}>;
  isReadOnly: boolean;
  /**
   * Open the workspace of one placement, or of the map itself (undefined) —
   * the map editor's third view (specs/MAP_FIRST.md, "The editor's modes").
   */
  onEditScript?: (id: string | undefined) => void;
  /**
   * The events an actor of a kind can start a section with, for the quick
   * add in the inspector (`blockly/eventChoices`). Absent, it is not offered.
   */
  eventsFor?: (kind: string) => readonly EventChoice[];
  /** What the toolbar's way into the map's own workspace says. */
  mapScriptLabel?: string;
  /**
   * What a gated lab WITHHOLDS here (specs/CURRICULUM_PLAN.md,
   * specs/KINDS_FROM_THE_MAP_PLAN.md). A withheld control is drawn, disabled,
   * beside the lesson that grants it — so a learner looking round can tell
   * what is not theirs yet from what does not exist — and nothing else
   * changes: the canvas draws the layers and the marks the map has, and a
   * new placement lands on the default layer.
   */
  withheld?: ReadonlySet<Affordance>;
  /**
   * App Builder (`appBuilder`): no layers and no cameras — no buttons for
   * them, no strip, no Layer on a placement. LEFT OUT rather than withheld,
   * since no lesson grants them to an app. A map that has layers still draws
   * them.
   */
  appBuilder?: boolean;
  /**
   * The kinds that have a file of their own, by type, with the name each
   * declares: what `Enhance ⟨Hero⟩…` and `Open ⟨Hero⟩` say and act on.
   */
  kinds?: Readonly<Record<string, {name: string}>>;
  /** Open the Enhance checklist on a kind — its abilities, ticked. */
  onEnhanceKind?: (type: string) => void;
  /** Make a kind's own file the active tab. */
  onOpenKind?: (type: string) => void;
  /**
   * The world this map is the main map of, shown in the inspector with
   * nothing selected (`WorldInspector`); absent for a `.map`.
   *
   * Without the background image, which the stage supplies itself: it is a
   * property of the MAP this stage is showing, written the way every other
   * map-level change is. The theme is the world's, so the caller says how it
   * is written.
   */
  world?: Omit<
    WorldInspectorProps,
    | 'isReadOnly'
    | 'theme'
    | 'themeOptions'
    | 'onTheme'
    | 'background'
    | 'backgrounds'
    | 'onBackground'
  > & {
    /** The world's theme changed: its `use theme` row (`worldProperties`). */
    onTheme?: (path: string | undefined) => void;
  };
  /**
   * The cameras the world's own workspace declares, for the camera strip on a
   * main map with nothing selected. Read by the editor, which has the file's
   * text; the stage knows nothing of files (`worldCameras`).
   */
  worldCameras?: readonly DeclaredCamera[];
  /**
   * The edits the world's cameras take, made in the world's code by the
   * editor, which has the file (`worldCameraCode`); absent for a `.map`.
   */
  worldCameraEditor?: WorldCameraEditor;
  /**
   * The traits the project's rules offer a camera, for a selected
   * Viewport's cameras; absent, a Viewport's are listed and not edited.
   */
  cameraChoices?: readonly CameraTraitChoice[];
  /**
   * The project's maps as `[name, path]`, for a Viewport's `map` property
   * (specs/VIEWPORT_PLAN.md) — the one string the inspector offers a list
   * for that the sandbox cannot supply, since which maps a project holds is
   * the editor's to know.
   */
  mapChoices?: ReadonlyArray<readonly [string, string]>;
  /**
   * The map each Viewport placement holds, by placement id, parsed by the
   * editor from the file its `map` names — drawn inside the Viewport's box,
   * dimmed, so the main map reads as the game rather than as a readout over
   * an empty box.
   */
  heldMaps?: Readonly<Record<string, MapDoc>>;
  /**
   * The project's backgrounds, by file name, for a layer's two slots — and
   * the same images decoded, so the canvas can draw the one a slot names
   * (specs/LAYERS_PLAN.md).
   */
  backgroundChoices?: readonly string[];
  backgroundImages?: Readonly<Record<string, HTMLImageElement>>;
  /**
   * The window this map will be seen through, in pixels — see the guide below.
   *
   * Given by the caller rather than read from the constant, because a world
   * says how much of itself is on screen (`set size of view`) and a map drawn
   * against somebody else's window shows a dashed rectangle in the wrong
   * place. Absent is the standard window, which is what every map had.
   */
  visible?: Size;
}

/**
 * The canvas and its inspector.
 *
 * Snap-to-grid by default; hold Alt to place freely. Middle-drag (or left-drag
 * with no actor selected) pans; the wheel zooms toward the cursor; a button
 * resets the view. In select mode, clicking a placed actor selects it, the arrow
 * keys cycle the selection (panning it into view), Shift+arrow nudges it a tile
 * (a pixel with Alt), dragging moves it, Delete removes it, and the inspector
 * edits its position and its other properties.
 */
/**
 * The quick-add menu's rows: each event under the drawer it is in, flat, as
 * a menu's children have to be its rows.
 */
const eventRows = (
  choices: readonly EventChoice[],
  onPick: (type: string) => void,
) => {
  if (choices.length === 0) {
    return [
      <MenuItem key="none" dense disabled>
        No events reach this kind
      </MenuItem>,
    ];
  }
  const rows: JSX.Element[] = [];
  let drawer = '';
  for (const choice of choices) {
    if (choice.drawer !== drawer) {
      drawer = choice.drawer;
      rows.push(
        <ListSubheader key={`drawer:${drawer}`}>{drawer}</ListSubheader>,
      );
    }
    rows.push(
      <MenuItem key={choice.type} dense onClick={() => onPick(choice.type)}>
        {choice.label}
      </MenuItem>,
    );
  }
  return rows;
};

/**
 * A button on the map's toolbar: an icon, with its words as its accessible
 * name and the tooltip a pointer finds, as the inspector's icon actions'
 * are (`IconAction`).
 *
 * A SWITCH — the code marks, the Layers list, the Cameras list — is coloured
 * as a tab is: the brand's primary while on, neutral while off, with no box
 * either way, and `aria-pressed` says which. An action — Reset view, the
 * way into the map's own code — is the neutral one, with no state to show;
 * that way into code wears the blocks icon every way into code does.
 */
const ToolbarIcon = ({
  label,
  icon,
  pressed,
  ...rest
}: {
  label: string;
  icon: string;
  /** On or off, for a switch; absent for an action. */
  pressed?: boolean;
  className?: string;
  onClick?: () => void;
  'aria-disabled'?: true;
  'aria-describedby'?: string;
}) => (
  <Tooltip title={label}>
    <IconButton
      aria-label={label}
      aria-pressed={pressed}
      variant="text"
      color={pressed ? 'primary' : 'secondary'}
      size="extraSmall"
      {...rest}
    >
      <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
    </IconButton>
  </Tooltip>
);

/** What the world's cameras can be told, from the strip and the inspector. */
export interface WorldCameraEditor {
  /** The camera the world starts looking through (`MAIN_CAMERA` default). */
  starting: string;
  /** The traits the project's rules offer a camera. */
  choices: readonly CameraTraitChoice[];
  traitsOf: (id: string) => string[];
  valueOf: (id: string, property: CameraProperty) => string | undefined;
  /** Add one, answering its id. */
  add: () => string | undefined;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  setStarting: (id: string) => void;
  setTrait: (id: string, trait: string, elected: boolean) => void;
  setValue: (id: string, property: CameraProperty, value: string) => void;
}

export const MapStage = ({
  doc,
  onDocChange,
  onDocPreview,
  onEditScript,
  eventsFor,
  worldCameras = [],
  worldCameraEditor,
  cameraChoices,
  withheld,
  appBuilder = false,
  kinds,
  onEnhanceKind,
  onOpenKind,
  mapScriptLabel = 'Map code',
  world,
  mapChoices,
  heldMaps,
  backgroundChoices,
  backgroundImages,
  placing,
  thumbnails,
  pictures,
  schemas,
  themeOptions = [],
  sizes,
  placementSizes,
  scales,
  isReadOnly,
  visible = STANDARD_WINDOW,
}: MapStageProps) => {
  // The document as this stage currently has it. A drag mutates it live for
  // feedback and commits once on release, so the local copy leads and the
  // caller's follows; a document arriving from outside replaces it.
  const [map, setMap] = useState(doc);
  useEffect(() => setMap(doc), [doc]);
  // The map's extent in world pixels — what the camera fits and the canvas
  // draws. Read from the document, so resizing the map moves the border.
  const extent = extentOf(map);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  // The last picture drawn for each placement, by id, for the frames between
  // an edit and the sandbox's answer to it (`stageGeometry.rememberedPicture`).
  const remembered = useRef(new Map<string, Remembered<Picture>>());
  // The template to PLACE is the caller's (`placing`); when it is null we are in
  // select mode, where `selectedId` is the placed instance under edit.
  const selected = placing;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /**
   * Whether placements with a script wear their corner mark. On by default:
   * a map is read for where its behavior is; off for a screenshot or a
   * crowded level.
   */
  const [showIcons, setShowIcons] = useState(true);

  // What a gated lab withholds (`WithheldNote`). A withheld control is
  // `aria-disabled`, NOT `disabled`: a disabled button leaves the tab order,
  // and a keyboard then has no way to reach it and hear why. It keeps its
  // place, does nothing, and is described by the note beside it, which names
  // the lesson that grants it. `where` tells two notes about one affordance
  // apart — scripts have a way in from the toolbar and one in the inspector.
  const locked = (id: Affordance): boolean => withheld?.has(id) ?? false;
  // Whether a placement's script may be opened from the canvas — the floating
  // button, a double-click, Enter. Withheld, the inspector's button stays and
  // says which lesson brings it; the canvas offers nothing.
  const canOpenScript = Boolean(onEditScript) && !locked('map-scripts');
  /** The open quick-add menu's anchor: the button it opened from. */
  const [eventMenu, setEventMenu] = useState<HTMLElement | null>(null);
  const noteId = (id: Affordance, where: string) => `withheld-${id}-${where}`;
  const orWithheld = (id: Affordance, where: string, act: () => void) =>
    locked(id)
      ? {
          'aria-disabled': true as const,
          'aria-describedby': noteId(id, where),
        }
      : {onClick: act};
  const withheldClass = (id: Affordance) =>
    locked(id) ? styles.withheld : undefined;
  /** The note a withheld control points at, or nothing when it is held. */
  const note = (id: Affordance, where: string) =>
    locked(id) ? <WithheldNote affordance={id} id={noteId(id, where)} /> : null;
  /**
   * The layer a new placement lands on, and the one the strip shows as
   * selected; and whether its inspector is open, which it is from a click on
   * its row until it is closed or a placement is selected.
   */
  const [selectedLayer, setSelectedLayer] = useState(DEFAULT_LAYER);
  const [inspectingLayer, setInspectingLayer] = useState(false);
  /** The world's camera open in its inspector, if one is. */
  const [inspectingCamera, setInspectingCamera] = useState<string | null>(null);
  // A placement selected closes the layer's and the camera's inspectors, so
  // deselecting it goes back to the world's rather than to one nobody asked
  // for again.
  useEffect(() => {
    if (selectedId) {
      setInspectingLayer(false);
      setInspectingCamera(null);
    }
  }, [selectedId]);
  /**
   * The actor-typed property being POINTED at something, if any.
   *
   * A reference's other affordance is a dropdown of every placement in the
   * map, which is exact and unreadable the moment a level has thirty things in
   * it. Pointing is the gesture the canvas is already for: press the button
   * beside the field, then click the actor.
   *
   * The dropdown STAYS. A canvas click is not reachable from a keyboard, and
   * an affordance that is the only way to do something has to be.
   */
  const [picking, setPicking] = useState<{
    ownerId: string;
    propId: string;
  } | null>(null);
  // The placed actor under the cursor in select mode, highlighted so a heavily
  // skewed sprite (drawn far from a naive center point) is easy to find and grab.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hover, setHover] = useState<Vec | null>(null);
  const [size, setSize] = useState<Size>({w: 0, h: 0});
  const [view, setView] = useState<View | null>(null);
  const [panning, setPanning] = useState(false);
  // Inspector field drafts keyed by field name: `id`, or `${ownerId}.${propId}`
  // for a scalar, or `${ownerId}.${propId}.x` / `.y` for a vector component.
  // Strings so a field can be cleared mid-edit; seeded from the selected actor on
  // selection change and after a drag; a scalar edit applies live + commits on
  // blur, an id edit renames on blur.
  const [draft, setDraft] = useState<Record<string, string>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest map, for gesture handlers that commit once at the end (a drag mutates
  // it live for feedback but writes `onChange` only on release).
  const mapRef = useRef(map);
  mapRef.current = map;
  // Active pan gesture: the pointer/offset at drag start (a ref so pointermove
  // doesn't need it in a dependency).
  const panRef = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    id: number;
  } | null>(null);
  // Active actor-move gesture: which instance, the grab offset (actor − pointer,
  // in world units), the pointer id, and whether it actually moved.
  /**
   * A grip being dragged: which one, the box as it was when the drag began,
   * and where the pointer started.
   *
   * THE BOX AS IT WAS, not as it is. Each move works out the answer from the
   * TOTAL movement since the press rather than accumulating per-event deltas,
   * so a slow drag and a fast one over the same distance land in the same
   * place and nothing rounds away (`rotatedResize`, ported from Sketch Lab).
   */
  const gripRef = useRef<{
    handle: ResizeHandle | 'turn';
    start: Box;
    from: {x: number; y: number};
    pointerId: number;
  } | null>(null);

  const dragRef = useRef<{
    id: string;
    offX: number;
    offY: number;
    pointerId: number;
    moved: boolean;
    /** What its edges snap by, or nothing if it snaps by its middle. */
    box?: {width: number; height: number};
  } | null>(null);

  // Entering place mode drops any placed-actor selection: the two modes are
  // exclusive, and an inspector for something you are no longer editing is a
  // panel in the way.
  useEffect(() => {
    if (placing) {
      setSelectedId(null);
    }
  }, [placing]);

  // Decode thumbnail data URLs to images for canvas drawing.
  useEffect(() => {
    for (const [type, url] of Object.entries(thumbnails)) {
      if (images[type]) {
        continue;
      }
      const image = new Image();
      image.onload = () => setImages(prev => ({...prev, [type]: image}));
      image.src = url;
    }
  }, [thumbnails, images]);

  // Track the pane size; the canvas buffer follows it so the map fills the space.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({w: Math.round(rect.width), h: Math.round(rect.height)});
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Initialise the camera to the fit view once the pane has a size.
  //
  // `extent` is read but not depended on: resizing the map must NOT move a
  // camera the author has panned or zoomed — they resized the map, not the
  // view. `Fit` is how they ask for the new extent to be framed.
  const extentRef = useRef(extent);
  extentRef.current = extent;
  useEffect(() => {
    if (size.w > 0 && size.h > 0 && !view) {
      setView(fitView(size.w, size.h, extentRef.current));
    }
  }, [size, view]);

  // Wheel zoom toward the cursor. A native, non-passive listener so we can
  // preventDefault (the pane must not scroll under the zoom).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = event.clientX - rect.left;
      const sy = event.clientY - rect.top;
      setView(v => v && zoomToward(v, sx, sy, event.deltaY));
    };
    canvas.addEventListener('wheel', onWheel, {passive: false});
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const commit = (next: MapDoc) => {
    setMap(next);
    onDocChange(next);
  };

  // A client point, through the canvas's rectangle and the camera. The
  // arithmetic is `stageGeometry`'s; what this adds is the one thing a pure
  // function cannot know, which is where the canvas is on the page.
  const screenToWorld = (clientX: number, clientY: number): Vec => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return toWorld(view!, clientX - rect.left, clientY - rect.top);
  };

  // Put a position on the grid unless Alt frees it. WITH a box, the box's
  // edges land on the grid lines; without one, the actor's middle lands on a
  // cell's middle, which is what a tile-sized thing wants (`snapToTile`).
  const snap = (
    pos: Vec,
    free: boolean,
    box?: {width: number; height: number},
  ): Vec => snapToTile(pos, map.tile, free, box);

  // How big a kind is drawn — the size the outline hugs and the hit test
  // reaches for (`stageGeometry.drawnSize`).
  const sizeOf = (type: string, placement?: string) =>
    drawnSize(sizes, type, placement ? placementSizes?.[placement] : undefined);

  // The topmost placed actor under a world point, through each one's own
  // transform (`stageGeometry.hitTest`). Reads the ref rather than the state
  // so a gesture mid-drag sees the position it just wrote.
  const hitUnder = (world: Vec): Placement | undefined =>
    hitTest(mapRef.current.actors, world, sizes, scales, placementSizes);

  /**
   * What to STORE so that placement `id` lands at world point `at`: the
   * point itself for a root, and the point in its parent's frame for a
   * child (`mapModel.toLocalPosition`).
   */
  const storedPosition = (id: string, at: Vec): Vec => {
    const actors = mapRef.current.actors;
    const actor = actors.find(one => one.id === id);
    const parentId = actor && parentIdOf(actor);
    const parent = parentId && actors.find(one => one.id === parentId);
    return parent
      ? toLocalPosition(at, worldTransformOf(parent, actors, scales))
      : at;
  };

  // Live-patch a placed actor's `owner.prop` override (local only — a drag or
  // field edit commits once on release / blur).
  const setProperty = (
    id: string,
    ownerId: string,
    propId: string,
    value: unknown,
  ) => {
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === id ? withProperty(a, ownerId, propId, value) : a,
      ),
    };
    mapRef.current = next;
    setMap(next);
    onDocPreview?.(next);
  };

  const deleteActor = (id: string) => {
    commit(withoutPlacement(mapRef.current, id));
    setSelectedId(null);
  };

  // --- Inspector: edit the selected actor's properties -------------------

  const selectedActor = selectedId
    ? (map.actors.find(a => a.id === selectedId) ?? null)
    : null;
  // "Show me" on something in a placement's properties needs a placement
  // selected (`callouts/reveal`). By the NAME its kind declares — `Enhance
  // Ground…` wants a Ground — or by its own id; with no name, whatever is
  // selected stays, and with nothing selected the first placement is.
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const kindsRef = useRef(kinds);
  kindsRef.current = kinds;
  useEffect(() => {
    setRevealer('placement', ({named}) => {
      const actors = mapRef.current.actors;
      const wanted = named?.toLowerCase();
      const isWanted = (actor: Placement) =>
        kindsRef.current?.[actor.type]?.name.toLowerCase() === wanted ||
        actor.id.toLowerCase() === wanted;
      const current = actors.find(actor => actor.id === selectedRef.current);
      // Already one of those: a learner who selected the second Hero keeps
      // it. Otherwise the first that answers to the name, or the first.
      const found =
        current && (!wanted || isWanted(current))
          ? current
          : wanted
            ? actors.find(isWanted)
            : actors[0];
      if (!found) {
        return false;
      }
      if (found !== current) {
        setSelectedId(found.id);
      }
      setInspectingLayer(false);
      return true;
    });
    return () => setRevealer('placement', null);
  }, []);

  // The layers and the cameras are rarely what a map is being opened for, and
  // each is a column of rows over the top-left of the map, so each starts
  // hidden behind a toolbar button. A lesson that points at one opens it
  // (`callouts/places`, `map.layers`).
  const [panels, setPanels] = useState({layers: false, cameras: false});
  const togglePanel = (panel: 'layers' | 'cameras') =>
    setPanels(open => ({...open, [panel]: !open[panel]}));
  useEffect(() => {
    setRevealer('mapPanel', ({panel}) => {
      // An app has neither panel, so there is nothing to open.
      if (appBuilder) {
        return false;
      }
      setPanels(open => ({...open, [panel]: true}));
      return true;
    });
    return () => setRevealer('mapPanel', null);
  }, [appBuilder]);

  /** The selected placement's kind, when it has a file of its own. */
  const selectedKind = selectedActor ? kinds?.[selectedActor.type] : undefined;
  /** The layer whose inspector is open, if the map still has it. */
  const inspectedLayer = layersOf(map).find(
    layer => layer.id === selectedLayer,
  );
  // The selected type's editable schema (trait groups), introspected in the
  // sandbox; empty until it arrives, or `[]` when nothing is selected.
  const selectedSchema: ActorSchema = selectedActor
    ? (schemas[selectedActor.type] ?? [])
    : [];

  const fieldKey = (prop: PropertySchema, axis?: 'x' | 'y') =>
    axis
      ? `${prop.ownerId}.${prop.propId}.${axis}`
      : `${prop.ownerId}.${prop.propId}`;

  // The property's current value: the placement's override, else the default.
  const valueOf = (actor: Placement, prop: PropertySchema): unknown =>
    propValue(actor, prop.ownerId, prop.propId) ?? prop.default;

  /**
   * Whether a kind is a RECORD — fields, and nowhere to be.
   *
   * ASKED OF THE SCHEMA, because that is the one place the editor can see it.
   * The sandbox lists a trait group per trait the actor HAS, so a kind that
   * said `is data` has no positional trait and therefore no `positional`
   * group. There is no separate flag to keep in step with the truth
   * (specs/RECORDS_PLAN.md).
   *
   * A kind whose schema has not arrived yet is not a record. It is the
   * honest answer while nothing is known, and it is the one that keeps a
   * placement on the canvas rather than making it vanish into the list for a
   * frame.
   */
  const isRecordKind = (type: string): boolean => {
    const schema = schemas[type];
    return (
      schema !== undefined &&
      schema.length > 0 &&
      !schema.some(group => group.trait === 'positional')
    );
  };

  /** What this map holds that is not anywhere — the panel's rows. */
  const records = map.actors.filter(actor => isRecordKind(actor.type));
  /** …and every record kind the project has, for the panel's Add. */
  const recordKinds = Object.keys(schemas).filter(isRecordKind).sort();
  /** `actors/note` → `Note`, which is what a kind is called. */
  const kindName = (type: string) => {
    const stem = type.split('/').pop() ?? type;
    return stem.charAt(0).toUpperCase() + stem.slice(1);
  };

  /**
   * Put a record in the map — with NO POSITION, which is what makes it one.
   *
   * The stage's draw loop and its hit test both skip a placement with no
   * stored position already (`stageGeometry`), so this needs nothing of them:
   * a record is invisible and unclickable on the canvas by virtue of being a
   * record (specs/RECORDS_PLAN.md).
   */
  const addRecord = (type: string) => {
    const name = type.split('/').pop() ?? type;
    const id = `${name}-${crypto.randomUUID().slice(0, 8)}`;
    commit({
      ...mapRef.current,
      actors: [...mapRef.current.actors, {type, id}],
    });
    setSelectedId(id);
    setInspectingLayer(false);
  };

  /**
   * The box a placement has, when it has one — `Has a Box`, which every
   * interface actor elects (specs/BOXES_PLAN.md).
   *
   * Through the SCHEMA rather than by reading the override alone, so an actor
   * that has never been resized reports the size its kind was built at rather
   * than nothing. A kind with no box at all — a Coin, a Ground — answers
   * undefined, which is how the handles know not to draw.
   */
  const boxOf = (
    actor: Placement,
  ): {width: number; height: number} | undefined => {
    const schema = schemas[actor.type] ?? [];
    const find = (propId: string) =>
      schema
        .flatMap(group => group.props)
        .find(prop => prop.ownerId === BOX_OWNER && prop.propId === propId);
    const width = find('width');
    const height = find('height');
    if (!width || !height) {
      return undefined;
    }
    const size = (prop: PropertySchema) => asNum(valueOf(actor, prop)) ?? 0;
    return {width: size(width), height: size(height)};
  };

  /**
   * The size to snap an actor's EDGES by, in world space — or nothing, when
   * the actor has no edges the grid can line up with.
   *
   * Nothing for two reasons. A kind with no box is a Coin or a Ground: a tile
   * that wants to sit IN a cell, which is the older snap and still the right
   * one for it. And a box turned off the axes has no side parallel to a grid
   * line, so there is nothing to put on one — a quarter turn does, with the
   * width and the height swapped.
   */
  const snapBoxOf = (
    actor: Placement,
  ): {width: number; height: number} | undefined => {
    const size = boxOf(actor);
    if (!size) {
      return undefined;
    }
    const at = worldTransformOf(actor, mapRef.current.actors, scales);
    const quarter = normalizeRotation(at.rotation) / 90;
    if (Math.abs(quarter - Math.round(quarter)) > 1e-6) {
      return undefined;
    }
    const width = size.width * Math.abs(at.scale.x);
    const height = size.height * Math.abs(at.scale.y);
    return Math.round(quarter) % 2 === 0
      ? {width, height}
      : {width: height, height: width};
  };

  /**
   * The box of the kind that is about to be PLACED, at the size its file was
   * built at — so the ghost sits where the click will leave it.
   */
  const ghostBox = selected ? boxOf({type: selected, id: 'ghost'}) : undefined;

  /**
   * The selection as a box in WORLD space — what the grips are placed around
   * and what a drag resizes. Undefined for a kind with no box, which is how
   * everything below knows to draw and grab nothing.
   */
  const selectedBox: Box | undefined = (() => {
    if (!selectedActor) {
      return undefined;
    }
    const size = boxOf(selectedActor);
    if (!size) {
      return undefined;
    }
    // In WORLD space, through the parent chain — a child's stored transform is
    // its parent's frame, and a grip has to be where the thing is drawn.
    const at = worldTransformOf(selectedActor, map.actors, scales);
    return {
      center: at.pos,
      width: size.width * Math.abs(at.scale.x),
      height: size.height * Math.abs(at.scale.y),
      rotation: at.rotation,
    };
  })();

  /** Every grip and where it is, for drawing and for hit-testing alike. */
  const handlesOf = (box: Box) =>
    RESIZE_HANDLES.map(handle => ({handle, at: handlePoint(box, handle)}));

  /** A list property's rows, as the inspector draws them. */
  const listItems = (value: unknown): unknown[] =>
    Array.isArray(value) ? value : [];
  const itemKey = (prop: PropertySchema, index: number) =>
    `${fieldKey(prop)}.${index}`;

  // Seed every field draft from the selected actor's schema + current values.
  const seedDraft = (actor: Placement | null) => {
    if (!actor) {
      setDraft({});
      return;
    }
    const next: Record<string, string> = {id: actor.id};
    for (const group of schemas[actor.type] ?? []) {
      for (const prop of group.props) {
        const value = valueOf(actor, prop);
        if (prop.type === 'vector' || prop.type === 'point') {
          const v = asVec(value) ?? {x: 0, y: 0};
          next[fieldKey(prop, 'x')] = String(v.x);
          next[fieldKey(prop, 'y')] = String(v.y);
        } else if (prop.type === 'words' || prop.type === 'numbers') {
          // One draft per row, so a row being typed into is not clobbered by
          // its neighbours being added or removed.
          listItems(value).forEach((item, index) => {
            next[itemKey(prop, index)] = String(item ?? '');
          });
        } else if (prop.type !== 'boolean') {
          next[fieldKey(prop)] = String(value ?? '');
        }
      }
    }
    setDraft(next);
  };

  // Re-seed on selection change, or when the schema for the type arrives (it
  // loads async). NOT on every value change — a live edit or drag must not
  // clobber a field mid-type; a drag re-seeds explicitly on release.
  useEffect(() => {
    seedDraft(mapRef.current.actors.find(a => a.id === selectedId) ?? null);
    // …and disarm. An armed pick belongs to the property of the actor that was
    // selected when the button was pressed; carrying it to a different actor
    // would set a property nobody asked about.
    setPicking(null);
  }, [selectedId, schemas]);

  // Edit a scalar field: number applies parsed, string as-is; keep the draft.
  const editScalar = (prop: PropertySchema, value: string) => {
    setDraft(d => ({...d, [fieldKey(prop)]: value}));
    if (!selectedActor) {
      return;
    }
    if (prop.type === 'number' || prop.type === 'angle') {
      const n = Number(value);
      if (value.trim() === '' || !Number.isFinite(n)) {
        return;
      }
      setProperty(selectedActor.id, prop.ownerId, prop.propId, n);
    } else {
      setProperty(selectedActor.id, prop.ownerId, prop.propId, value);
    }
  };

  // Edit one component of a vector field.
  const editVector = (prop: PropertySchema, axis: 'x' | 'y', value: string) => {
    setDraft(d => ({...d, [fieldKey(prop, axis)]: value}));
    const n = Number(value);
    if (value.trim() === '' || !Number.isFinite(n) || !selectedActor) {
      return;
    }
    const cur = asVec(valueOf(selectedActor, prop)) ?? {x: 0, y: 0};
    setProperty(selectedActor.id, prop.ownerId, prop.propId, {
      x: axis === 'x' ? n : cur.x,
      y: axis === 'y' ? n : cur.y,
    });
  };

  // A LIST OF WORDS OR NUMBERS (specs/LISTS.md), a row at a time. Editing a
  // row is a field edit and commits on blur like one; adding and removing
  // rows are discrete and commit at once, the way a checkbox does.
  const editItem = (prop: PropertySchema, index: number, text: string) => {
    setDraft(d => ({...d, [itemKey(prop, index)]: text}));
    if (!selectedActor) {
      return;
    }
    const items = [...listItems(valueOf(selectedActor, prop))];
    if (prop.type === 'numbers') {
      const n = Number(text);
      if (text.trim() === '' || !Number.isFinite(n)) {
        return;
      }
      items[index] = n;
    } else {
      items[index] = text;
    }
    setProperty(selectedActor.id, prop.ownerId, prop.propId, items);
  };
  const setItems = (prop: PropertySchema, items: unknown[]) => {
    if (!selectedActor) {
      return;
    }
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, prop.ownerId, prop.propId, items)
          : a,
      ),
    };
    mapRef.current = next;
    commit(next);
    seedDraft(next.actors.find(a => a.id === selectedActor.id) ?? null);
  };
  const addItem = (prop: PropertySchema) => {
    if (!selectedActor) {
      return;
    }
    setItems(prop, [
      ...listItems(valueOf(selectedActor, prop)),
      prop.type === 'numbers' ? 0 : '',
    ]);
  };
  const removeItem = (prop: PropertySchema, index: number) => {
    if (!selectedActor) {
      return;
    }
    setItems(
      prop,
      listItems(valueOf(selectedActor, prop)).filter((_, at) => at !== index),
    );
  };

  // Toggle a boolean — a discrete action, so commit immediately.
  const toggleBool = (prop: PropertySchema, checked: boolean) => {
    if (!selectedActor) {
      return;
    }
    commit({
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, prop.ownerId, prop.propId, checked)
          : a,
      ),
    });
  };

  // Select an enum option (dropdown) — also a discrete action; commit at once.
  const selectOption = (prop: PropertySchema, value: string) => {
    if (!selectedActor) {
      return;
    }
    setDraft(d => ({...d, [fieldKey(prop)]: value}));
    // A parent chosen here keeps the placement where it is on the canvas,
    // as the engine's `set parent` does: the stored transform is rewritten
    // in the new parent's frame (`mapModel.withParent`).
    const isParent = prop.ownerId === 'positional' && prop.propId === 'parent';
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? isParent
            ? withParent(a, value || undefined, mapRef.current.actors, scales)
            : withProperty(a, prop.ownerId, prop.propId, value)
          : a,
      ),
    };
    mapRef.current = next;
    commit(next);
  };
  /** A theme imported from a placement's Theme field (`useAfterImport`). */
  const importThemeThen = useAfterImport<PropertySchema>(
    themeOptions.map(([, path]) => path),
    (path, prop) => selectOption(prop, path),
  );

  /** The ids a set-valued property currently names, in order. */
  const chosenIds = (actor: Placement, prop: PropertySchema): string[] =>
    chosenActors(actor, prop.ownerId, prop.propId);

  /**
   * Write a set-valued property whole.
   *
   * Whole rather than by adding and removing in place, because the map holds
   * a list and a list is a value: writing it entire is what makes an undo one
   * step and what keeps the file the same shape however it was edited.
   */
  const setChosen = (prop: PropertySchema, ids: readonly string[]) => {
    if (!selectedActor) {
      return;
    }
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, prop.ownerId, prop.propId, [...ids])
          : a,
      ),
    };
    mapRef.current = next;
    commit(next);
  };

  const editId = (value: string) => setDraft(d => ({...d, id: value}));

  // Persist an in-progress edit (writes the `.map`, recompiles) — on blur/Enter.
  const commitEdit = () => {
    if (selectedId) {
      commit(mapRef.current);
    }
  };

  // Apply an id rename on blur / Enter. Rejects an empty name or one already
  // taken by another actor (which would make selection ambiguous), reverting.
  const applyRename = () => {
    if (!selectedActor) {
      return;
    }
    const next = draft.id?.trim() ?? '';
    const taken = mapRef.current.actors.some(
      a => a.id === next && a !== selectedActor,
    );
    if (!next || next === selectedActor.id || taken) {
      setDraft(d => ({...d, id: selectedActor.id}));
      return;
    }
    // …and every block that named the old name, in any workspace of the map.
    const updated = renamePlacementReferences(
      {
        ...mapRef.current,
        actors: mapRef.current.actors.map(a =>
          a.id === selectedActor.id ? {...a, id: next} : a,
        ),
      },
      selectedActor.id,
      next,
    );
    mapRef.current = updated;
    commit(updated);
    setSelectedId(next);
  };

  const blurOnEnter = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Render one property's editor by type: number/string → a field, vector → an
  // X/Y pair, boolean → a checkbox, color → a swatch and a hex field.
  const renderProp = (actor: Placement, prop: PropertySchema) => {
    if (prop.type === 'boolean') {
      return (
        <Checkbox
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          label={capitalize(prop.name)}
          checked={Boolean(valueOf(actor, prop))}
          disabled={isReadOnly}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            toggleBool(prop, event.target.checked)
          }
        />
      );
    }
    if (prop.type === 'actor') {
      // A REFERENCE to another placement, stored as its id and resolved by
      // `WorldBuilder.loadMap` once every entry exists. The list is the map's
      // own placements, which is the one thing the sandbox cannot supply: it
      // introspects actor KINDS, and which of them a particular map holds is
      // this editor's to know.
      //
      // Itself excluded, and anonymous placements with it — see
      // `placementChoices`, which is where that list is decided.
      const others = placementChoices(mapRef.current.actors, actor.id);
      const pickingThis =
        picking?.ownerId === prop.ownerId && picking?.propId === prop.propId;
      return (
        <div key={fieldKey(prop)} className={styles.inspectorPick}>
          <SimpleDropdown
            name={`prop-${fieldKey(prop)}`}
            labelText={capitalize(prop.name)}
            size="s"
            className={styles.inspectorDropdown}
            disabled={isReadOnly}
            selectedValue={draft[fieldKey(prop)] ?? ''}
            items={[{value: '', text: '(none)'}, ...others]}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              selectOption(prop, event.target.value)
            }
          />
          <Button
            variant={pickingThis ? 'contained' : 'text'}
            size="extraSmall"
            disabled={isReadOnly}
            aria-pressed={pickingThis}
            onClick={() =>
              setPicking(
                pickingThis
                  ? null
                  : {ownerId: prop.ownerId, propId: prop.propId},
              )
            }
          >
            {pickingThis ? 'Click an actor…' : 'Pick'}
          </Button>
        </div>
      );
    }
    if (prop.type === 'actors') {
      // SEVERAL references, and the same bargain as one: each is stored as a
      // placement's id and resolved by `loadMap` once every entry exists.
      //
      // A list rather than a multi-select, because the thing a person wants to
      // do here is see what is in the set and take one out — and because the
      // canvas is already drawing an outline round every one of them, so the
      // panel's job is to name them and let go of them, not to be the only
      // place they appear.
      const chosen = chosenIds(actor, prop);
      const others = placementChoices(mapRef.current.actors, actor.id);
      const pickingThis =
        picking?.ownerId === prop.ownerId && picking?.propId === prop.propId;
      return (
        <div key={fieldKey(prop)} className={styles.inspectorSet}>
          <span className={styles.inspectorSetLabel}>
            {capitalize(prop.name)}
          </span>
          {chosen.length === 0 ? (
            <span className={styles.inspectorSetEmpty}>(none)</span>
          ) : (
            <ul className={styles.inspectorSetList}>
              {chosen.map(id => (
                <li key={id} className={styles.inspectorSetItem}>
                  <span>
                    {others.find(one => one.value === id)?.text ?? id}
                  </span>
                  <Button
                    variant="text"
                    size="extraSmall"
                    disabled={isReadOnly}
                    aria-label={`Remove ${id}`}
                    onClick={() =>
                      setChosen(
                        prop,
                        chosen.filter(one => one !== id),
                      )
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            variant={pickingThis ? 'contained' : 'text'}
            size="extraSmall"
            disabled={isReadOnly}
            aria-pressed={pickingThis}
            onClick={() =>
              setPicking(
                pickingThis
                  ? null
                  : {ownerId: prop.ownerId, propId: prop.propId},
              )
            }
          >
            {pickingThis ? 'Click an actor…' : 'Add'}
          </Button>
        </div>
      );
    }
    if (prop.type === 'words' || prop.type === 'numbers') {
      const items = selectedActor
        ? listItems(valueOf(selectedActor, prop))
        : [];
      return (
        <div key={fieldKey(prop)} className={styles.inspectorPick}>
          <Typography variant="body3" component="span">
            {capitalize(prop.name)}
          </Typography>
          {items.length > 0 && (
            <ul className={styles.inspectorSetList}>
              {items.map((_, index) => (
                <li key={index} className={styles.inspectorSetItem}>
                  <TextField
                    name={`prop-${itemKey(prop, index)}`}
                    label={`${capitalize(prop.name)} ${index + 1}`}
                    inputType={prop.type === 'numbers' ? 'number' : 'text'}
                    size="s"
                    value={draft[itemKey(prop, index)] ?? ''}
                    disabled={isReadOnly}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      editItem(prop, index, event.target.value)
                    }
                    onBlur={commitEdit}
                    onKeyDown={blurOnEnter}
                  />
                  <Button
                    variant="text"
                    size="extraSmall"
                    disabled={isReadOnly}
                    aria-label={`Remove ${prop.name} ${index + 1}`}
                    onClick={() => removeItem(prop, index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="text"
            size="extraSmall"
            disabled={isReadOnly}
            aria-label={`Add to ${prop.name}`}
            onClick={() => addItem(prop)}
          >
            Add
          </Button>
        </div>
      );
    }
    if (prop.ownerId === 'showsMap' && prop.propId === 'map') {
      // A Viewport's map: the project's maps, by name (`mapChoices`).
      return (
        <SimpleDropdown
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          labelText="Map"
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={draft[fieldKey(prop)] ?? ''}
          items={[
            {value: '', text: '(none)'},
            ...(mapChoices ?? []).map(([name, path]) => ({
              value: path,
              text: name,
            })),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            selectOption(prop, event.target.value)
          }
        />
      );
    }
    if (prop.type === 'string' && prop.options) {
      return (
        <SimpleDropdown
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          labelText={capitalize(prop.name)}
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={draft[fieldKey(prop)] ?? ''}
          items={[
            {value: '', text: '(none)'},
            ...prop.options.map(option => ({value: option, text: option})),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            selectOption(prop, event.target.value)
          }
        />
      );
    }
    // THE ONE PROPERTY THE INSPECTOR KNOWS BY NAME, and the comment is the
    // justification. `theme` is a string, because an actor's own properties
    // have no closed-set type (`blockly/ruleMeta`, PROPERTY_TYPES) — and a
    // free-text box for a module path is the silent-name failure this lab
    // keeps meeting: type it wrong and the placement takes its map's theme,
    // quietly. So this one is special-cased into a dropdown of the project's
    // themes, and an enum property type is what would replace it the day a
    // second property wants one (specs/STYLES_PLAN.md).
    // WHICH CAMERA A VIEWPORT LOOKS THROUGH, by name: a dropdown of its own
    // cameras rather than a box to type one into, where a name no camera
    // has quietly fell back to the main one (`ViewportShowsThroughProperty`).
    if (
      selectedActor &&
      prop.ownerId === VIEWPORT.trait &&
      prop.propId === VIEWPORT.showsThrough
    ) {
      const names = [
        ...(selectedActor.cameras ?? []),
        ...placementCameras(selectedActor.blocks),
      ].map(camera => camera.name);
      const chosen = draft[fieldKey(prop)] ?? '';
      return (
        <SimpleDropdown
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          labelText={capitalize(prop.name)}
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={chosen}
          items={[
            {value: '', text: 'Main camera'},
            ...[...new Set(names)].map(name => ({value: name, text: name})),
            // …and a name no camera has any more, shown as itself rather
            // than as the main camera it now falls back to.
            ...(chosen && !names.includes(chosen)
              ? [{value: chosen, text: `${chosen} (missing)`}]
              : []),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            selectOption(prop, event.target.value)
          }
        />
      );
    }
    if (prop.ownerId === STYLED.trait && prop.propId === STYLED.theme) {
      return (
        <SimpleDropdown
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          labelText="Theme"
          size="s"
          className={styles.inspectorDropdown}
          disabled={isReadOnly}
          selectedValue={draft[fieldKey(prop)] ?? ''}
          items={[
            // Empty is INHERIT, not "none": a placement that says nothing
            // takes its map's theme, and the map takes the world's.
            {value: '', text: '(the map’s)'},
            ...themeOptions.map(([label, path]) => ({
              value: path,
              text: label,
            })),
            // …and a way in, because a project starts with no themes and a
            // menu of one row says nothing about where one comes from. The
            // same seam the `use theme` block's `(import…)` uses.
            {value: IMPORT_STYLE_VALUE, text: '(import…)'},
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value === IMPORT_STYLE_VALUE) {
              // The import writes the file and answers its path, and the
              // placement takes it once the file is in the project — so
              // picking a theme and fetching one are one gesture
              // (`useAfterImport`).
              importThemeThen(requestStyleImport, prop);
              return;
            }
            selectOption(prop, event.target.value);
          }}
        />
      );
    }
    if (prop.type === 'color') {
      // NOT A DESIGN-SYSTEM COMPONENT, because there is not one: the library
      // has no color input, and `TextField`'s `inputType` does not admit
      // `color`. So this is an ordinary field with the browser's swatch beside
      // it — the field for pasting a hex somebody was given, the swatch for
      // picking, and both writing the same `#rrggbb` the engine and every
      // color block already speak (engine/core/color).
      //
      // THE FIELD COMES FIRST and the swatch after it, so that every field in
      // this panel starts at the same x whether or not its row has a swatch.
      // Leading with the picker indented the color rows by its width and left
      // every other row where it was (`styles/editor/styleEditor.module.css`
      // says the same of the theme editor, which is the same row).
      const typed = draft[fieldKey(prop)] ?? '';
      return (
        <div key={fieldKey(prop)} className={styles.inspectorColor}>
          <TextField
            name={`prop-${fieldKey(prop)}`}
            label={capitalize(prop.name)}
            size="s"
            value={typed}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              editScalar(prop, event.target.value)
            }
            onBlur={commitEdit}
            onKeyDown={blurOnEnter}
          />
          <input
            type="color"
            className={fields.swatch}
            name={`prop-${fieldKey(prop)}-swatch`}
            // NOT the property's own name, which the field beside it already
            // answers to: two controls in a row with one accessible name is a
            // reader saying "Color" twice and no way to tell them apart.
            aria-label={`pick ${prop.name}`}
            // The picker can only show a full six-digit hex. A value it cannot
            // parse would silently become black, so it shows white and the
            // field beside it still holds what is really stored.
            value={/^#[0-9a-fA-F]{6}$/.test(typed) ? typed : '#ffffff'}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              editScalar(prop, event.target.value)
            }
            onBlur={commitEdit}
          />
        </div>
      );
    }
    if (prop.type === 'vector') {
      // The block's own dial and arrow grid, as the world's inspector shows
      // one (`VectorInput`). A POINT stays two fields: a place is typed, a
      // direction is pointed. A move on the grid is a change and a commit in
      // one, like a checkbox, and the axis drafts follow it.
      const held = asVec(valueOf(actor, prop)) ?? {
        x: 0,
        y: 0,
      };
      return (
        <VectorInput
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          label={capitalize(prop.name)}
          value={held}
          disabled={isReadOnly}
          onChange={next => {
            setDraft(d => ({
              ...d,
              [fieldKey(prop, 'x')]: String(next.x),
              [fieldKey(prop, 'y')]: String(next.y),
            }));
            setProperty(actor.id, prop.ownerId, prop.propId, next);
            commitEdit();
          }}
        />
      );
    }
    if (prop.type === 'point') {
      // A child's position is stored in its parent's frame; the place it
      // lands on the canvas is worth seeing beside it.
      const carried =
        prop.ownerId === 'positional' &&
        prop.propId === 'position' &&
        selectedActor &&
        parentIdOf(selectedActor)
          ? worldTransformOf(selectedActor, map.actors, scales).pos
          : undefined;
      return (
        <div key={fieldKey(prop)} className={styles.inspectorGrid}>
          {carried && (
            <Typography
              variant="body3"
              component="span"
              className={styles.inspectorNote}
            >
              In the world: {Math.round(carried.x)}, {Math.round(carried.y)}
            </Typography>
          )}
          {(['x', 'y'] as const).map(axis => (
            <TextField
              key={axis}
              name={`prop-${fieldKey(prop, axis)}`}
              label={`${capitalize(prop.name)} ${axis.toUpperCase()}`}
              inputType="number"
              size="s"
              value={draft[fieldKey(prop, axis)] ?? ''}
              disabled={isReadOnly}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                editVector(prop, axis, event.target.value)
              }
              onBlur={commitEdit}
              onKeyDown={blurOnEnter}
            />
          ))}
        </div>
      );
    }
    if (prop.type === 'angle') {
      // The block's own dial and ring: a direction is chosen, not typed. A
      // turn of the dial is a change and a commit in one, like a checkbox.
      const held = Number(draft[fieldKey(prop)]);
      return (
        <AngleInput
          key={fieldKey(prop)}
          name={`prop-${fieldKey(prop)}`}
          label={capitalize(prop.name)}
          value={Number.isFinite(held) ? held : 0}
          disabled={isReadOnly}
          onChange={degrees => {
            editScalar(prop, String(degrees));
            commitEdit();
          }}
        />
      );
    }
    return (
      <TextField
        key={fieldKey(prop)}
        name={`prop-${fieldKey(prop)}`}
        label={capitalize(prop.name)}
        inputType={prop.type === 'number' ? 'number' : 'text'}
        size="s"
        value={draft[fieldKey(prop)] ?? ''}
        disabled={isReadOnly}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          editScalar(prop, event.target.value)
        }
        onBlur={commitEdit}
        onKeyDown={blurOnEnter}
      />
    );
  };

  const beginPan = (event: ReactPointerEvent, v: View) => {
    panRef.current = {
      sx: event.clientX,
      sy: event.clientY,
      ox: v.x,
      oy: v.y,
      id: event.pointerId,
    };
    canvasRef.current?.setPointerCapture(event.pointerId);
    setPanning(true);
  };

  const endGesture = () => {
    const grip = gripRef.current;
    if (grip) {
      canvasRef.current?.releasePointerCapture(grip.pointerId);
      gripRef.current = null;
      // Once, at the end. Every move wrote the map in memory so the grips and
      // the outline follow the pointer; writing it back recompiles the game,
      // which must happen when the drag is finished and not sixty times a
      // second while it is happening.
      commit(mapRef.current);
      seedDraft(
        mapRef.current.actors.find(one => one.id === selectedId) ?? null,
      );
      say(announceBox(selectedId ?? ''));
    }
    const drag = dragRef.current;
    if (drag) {
      canvasRef.current?.releasePointerCapture(drag.pointerId);
      dragRef.current = null;
      // Commit ONCE, and only if the actor actually moved — writing the `.map`
      // recompiles the game, so a bare select (down-up, no move) must not.
      if (drag.moved) {
        commit(mapRef.current);
      }
      // Reflect the dragged position in the inspector fields.
      seedDraft(mapRef.current.actors.find(a => a.id === drag.id) ?? null);
    }
    const pan = panRef.current;
    if (pan) {
      canvasRef.current?.releasePointerCapture(pan.id);
      panRef.current = null;
      setPanning(false);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (!view) {
      return;
    }
    if (event.button === 1) {
      event.preventDefault(); // middle button always pans
      beginPan(event, view);
      return;
    }
    if (event.button !== 0) {
      return;
    }
    // Left button in PLACE mode: placement happens on click, nothing on down.
    if (selected) {
      return;
    }
    const world = screenToWorld(event.clientX, event.clientY);
    const hit = isReadOnly ? undefined : hitUnder(world);
    // Left button while POINTING a reference: the click chooses, and does not
    // select or drag. Changing the selection would take away the very actor
    // whose property is being set, which is the one thing this must not do.
    if (picking && selectedActor) {
      event.preventDefault();
      setPicking(null);
      if (hit && hit.id !== selectedActor.id) {
        const prop = {
          ownerId: picking.ownerId,
          propId: picking.propId,
        } as PropertySchema;
        // A SET is added to and a single reference is replaced, which is the
        // whole difference between the two and the only place the click has to
        // know it. Naming the same actor twice adds nothing: a set holds a
        // thing or it does not.
        const isSet = (selectedSchema ?? [])
          .flatMap(group => group.props)
          .some(
            one =>
              one.ownerId === prop.ownerId &&
              one.propId === prop.propId &&
              one.type === 'actors',
          );
        const next = withPicked(
          propValue(selectedActor, prop.ownerId, prop.propId),
          hit.id,
          isSet,
        );
        if (Array.isArray(next)) {
          setChosen(prop, next);
        } else {
          selectOption(prop, next);
        }
      }
      // A click on nothing CANCELS rather than clearing the reference: undoing
      // a pick is what the dropdown's "(none)" row is for, and a missed click
      // should not be destructive.
      return;
    }
    // A GRIP FIRST, before whatever is under it. The grips sit on the
    // selection's edge, which is usually over the actor itself or over its
    // neighbour, so a press there means "resize this" rather than "select
    // that" (specs/BOXES_PLAN.md).
    if (selectedBox && selectedId && !isReadOnly) {
      const reach = HANDLE_SIZE / view.scale;
      const near = (at: {x: number; y: number}) =>
        Math.abs(at.x - world.x) <= reach && Math.abs(at.y - world.y) <= reach;
      const turnAt = rotationPoint(selectedBox, TURN_REACH / view.scale);
      const grabbed = near(turnAt)
        ? ('turn' as const)
        : handlesOf(selectedBox).find(one => near(one.at))?.handle;
      if (grabbed) {
        event.preventDefault();
        gripRef.current = {
          handle: grabbed,
          start: selectedBox,
          from: world,
          pointerId: event.pointerId,
        };
        canvasRef.current?.setPointerCapture(event.pointerId);
        return;
      }
    }
    // Left button in SELECT mode: grab a placed actor, else deselect + pan.
    if (hit) {
      event.preventDefault();
      const pos = worldTransformOf(hit, mapRef.current.actors, scales).pos;
      setSelectedId(hit.id);
      dragRef.current = {
        id: hit.id,
        offX: pos.x - world.x,
        offY: pos.y - world.y,
        pointerId: event.pointerId,
        moved: false,
        // Once, at the grab: the transform it snaps through cannot change
        // while the pointer is down, and a drag asks on every move.
        box: snapBoxOf(hit),
      };
      canvasRef.current?.setPointerCapture(event.pointerId);
      canvasRef.current?.focus(); // so Delete/Backspace reach onKeyDown
      return;
    }
    setSelectedId(null);
    event.preventDefault();
    beginPan(event, view);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    const grip = gripRef.current;
    if (grip) {
      const world = screenToWorld(event.clientX, event.clientY);
      if (grip.handle === 'turn') {
        turnTo(angleTo(grip.start.center, world), event.altKey);
      } else {
        // SNAP THE HANDLE, not the size. A resize has one edge that moves and
        // one that stays, so putting the moving edge on a grid line is what
        // makes the box's sides line up — snapping the WIDTH instead would
        // only do that when the far edge already happened to be on the grid.
        //
        // Which means measuring from where the handle WAS rather than from
        // where the pointer went down: the two differ by however far into the
        // grip the pointer landed, and carrying that offset along would keep
        // the edge a few pixels off every line. Alt wants the offset kept,
        // because Alt means "leave it exactly where I put it".
        //
        // A TURNED BOX IS LEFT ALONE, for the reason `snapBoxOf` gives: its
        // sides are not along the grid, so a grid crossing is not a place any
        // edge of it can be.
        const free =
          event.altKey || normalizeRotation(grip.start.rotation) % 90 !== 0;
        const from = free ? grip.from : handlePoint(grip.start, grip.handle);
        const to = free ? world : snapPoint(world, map.tile, false);
        const next = resizeBox({
          start: grip.start,
          handle: grip.handle,
          pointerDelta: {x: to.x - from.x, y: to.y - from.y},
          minWidth: MIN_BOX,
          minHeight: MIN_BOX,
        });
        sizeTo(next);
      }
      return;
    }
    const drag = dragRef.current;
    if (drag) {
      drag.moved = true;
      const world = screenToWorld(event.clientX, event.clientY);
      setProperty(
        drag.id,
        'positional',
        'position',
        storedPosition(
          drag.id,
          snap(
            {x: world.x + drag.offX, y: world.y + drag.offY},
            event.altKey,
            drag.box,
          ),
        ),
      );
      return;
    }
    const pan = panRef.current;
    if (pan) {
      const dx = event.clientX - pan.sx;
      const dy = event.clientY - pan.sy;
      setView(v => v && {...v, x: pan.ox + dx, y: pan.oy + dy});
      return;
    }
    // Idle: in place mode track the placement ghost; in select mode track which
    // placed actor sits under the cursor, so the render highlights it.
    if (selected && view) {
      setHover(
        snap(
          screenToWorld(event.clientX, event.clientY),
          event.altKey,
          ghostBox,
        ),
      );
      return;
    }
    if (view) {
      const hit = isReadOnly
        ? undefined
        : hitUnder(screenToWorld(event.clientX, event.clientY));
      setHoveredId(hit ? hit.id : null);
    }
  };

  const handlePointerLeave = () => {
    endGesture();
    setHover(null);
    setHoveredId(null);
  };

  // Pan the camera so `pos` is comfortably on-screen, centering it only when it
  // sits within a margin of the pane edge (or off it); the zoom is untouched. Used
  // when keyboard cycling lands on an actor that is scrolled out of view.
  const ensureVisible = (pos: Vec) => {
    const next = view && panIntoView(view, size, pos);
    if (next) {
      setView(next);
    }
  };

  // Move the selection to the next (`+1`) or previous (`-1`) placed actor, in
  // placement order and wrapping around. With nothing selected, `+1` starts at the
  // first actor and `-1` at the last. Only actors with a position participate.
  const cycleSelection = (dir: 1 | -1) => {
    const next = nextSelection(mapRef.current.actors, selectedId, dir);
    if (next) {
      setSelectedId(next.id);
      ensureVisible(worldTransformOf(next, mapRef.current.actors, scales).pos);
    }
  };

  /** One keyboard step, in tiles, per arrow. */
  /**
   * What just happened, for a screen reader.
   *
   * A CANVAS HAS NO ACCESSIBILITY TREE. Everything on this stage is painted
   * pixels: a placement is not an element, a handle is not a button, and a
   * resize changes nothing a reader can observe. So the editor says it out
   * loud instead — which is the only way the keyboard half of this feature is
   * usable by the people it is FOR (specs/BOXES_PLAN.md).
   *
   * Polite rather than assertive: a stream of sizes while somebody holds an
   * arrow down should not interrupt them mid-word.
   */
  const [announcement, setAnnouncement] = useState('');
  const say = (what: string) => setAnnouncement(what);

  const ARROW_STEPS: Record<string, {dx: number; dy: number}> = {
    ArrowRight: {dx: 1, dy: 0},
    ArrowLeft: {dx: -1, dy: 0},
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
  };

  /**
   * Move the selected actor a tile in an arrow's direction — a pixel with Alt,
   * which is the bargain the drag makes.
   *
   * The keyboard's half of dragging, and the half that was missing: a canvas
   * click is not reachable from a keyboard, and an actor that could only be
   * moved by one could only be moved by some people. A discrete edit, so it
   * commits at once, the way a checkbox does.
   */
  const nudgeSelection = (dx: number, dy: number, free: boolean) => {
    if (!selectedActor) {
      return;
    }
    const from = worldTransformOf(
      selectedActor,
      mapRef.current.actors,
      scales,
    ).pos;
    const to = storedPosition(
      selectedActor.id,
      steppedBy(from, map.tile, dx, dy, free, snapBoxOf(selectedActor)),
    );
    const next = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(a =>
        a.id === selectedActor.id
          ? withProperty(a, 'positional', 'position', to)
          : a,
      ),
    };
    mapRef.current = next;
    commit(next);
    seedDraft(next.actors.find(a => a.id === selectedActor.id) ?? null);
  };

  /**
   * Resize the selection, and say what it became.
   *
   * THE KEYBOARD'S RESIZE IS THE WHOLE RESIZE for anybody who cannot use the
   * handles — a canvas has no accessibility tree, so a drawn handle is
   * reachable by a pointer and by nothing else. So this is not a shortcut for
   * the drag; it is the other half of the same feature, and the drag reads the
   * same floor (specs/BOXES_PLAN.md).
   */
  const resizeSelection = (dw: number, dh: number) => {
    const actor = selectedActor;
    const box = actor ? boxOf(actor) : undefined;
    if (!actor || !box) {
      return;
    }
    const width = Math.max(MIN_BOX, Math.round(box.width + dw));
    const height = Math.max(MIN_BOX, Math.round(box.height + dh));
    commit({
      ...mapRef.current,
      actors: mapRef.current.actors.map(one =>
        one.id === actor.id
          ? withProperty(
              withProperty(one, BOX_OWNER, 'width', width),
              BOX_OWNER,
              'height',
              height,
            )
          : one,
      ),
    });
    say(`${actor.id} is ${width} by ${height}`);
  };

  /**
   * Write a size and a middle onto the selection, in memory.
   *
   * IN MEMORY, not committed: a drag calls this on every move so the outline
   * and the grips follow the pointer, and `endGesture` writes the map back
   * once at the end. The middle comes too because resizing from a corner MOVES
   * the thing — the far corner is what stays put.
   */
  const sizeTo = (next: {
    center: {x: number; y: number};
    width: number;
    height: number;
  }) => {
    const actor = selectedActor;
    if (!actor) {
      return;
    }
    const width = Math.max(MIN_BOX, Math.round(next.width));
    const height = Math.max(MIN_BOX, Math.round(next.height));
    mapRef.current = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(one =>
        one.id === actor.id
          ? withProperty(
              withProperty(
                withProperty(one, BOX_OWNER, 'width', width),
                BOX_OWNER,
                'height',
                height,
              ),
              'positional',
              'position',
              storedPosition(actor.id, next.center),
            )
          : one,
      ),
    };
    setMap(mapRef.current);
  };

  /** …and a rotation, on the same terms. Alt turns freely, else by the step. */
  const turnTo = (degrees: number, free: boolean) => {
    const actor = selectedActor;
    if (!actor) {
      return;
    }
    const turned = normalizeRotation(
      free ? degrees : Math.round(degrees / TURN_STEP) * TURN_STEP,
    );
    mapRef.current = {
      ...mapRef.current,
      actors: mapRef.current.actors.map(one =>
        one.id === actor.id
          ? withProperty(one, 'positional', 'rotation', turned)
          : one,
      ),
    };
    setMap(mapRef.current);
  };

  /** What a finished drag says out loud — see `say`. */
  const announceBox = (id: string): string => {
    const actor = mapRef.current.actors.find(one => one.id === id);
    const size = actor ? boxOf(actor) : undefined;
    const turned = actor
      ? (asNum(propValue(actor, 'positional', 'rotation')) ?? 0)
      : 0;
    return size
      ? `${id} is ${size.width} by ${size.height}, turned to ${turned} degrees`
      : '';
  };

  /** Turn the selection, and say what it became. */
  const turnSelection = (degrees: number) => {
    const actor = selectedActor;
    if (!actor) {
      return;
    }
    const was = asNum(propValue(actor, 'positional', 'rotation')) ?? 0;
    const turned = normalizeRotation(was + degrees);
    commit({
      ...mapRef.current,
      actors: mapRef.current.actors.map(one =>
        one.id === actor.id
          ? withProperty(one, 'positional', 'rotation', turned)
          : one,
      ),
    });
    say(`${actor.id} turned to ${turned} degrees`);
  };

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    // Escape disarms a reference pick, which is what Escape means everywhere:
    // the next click goes back to selecting, and nothing was changed.
    if (event.key === 'Escape' && picking) {
      event.preventDefault();
      setPicking(null);
      return;
    }
    // Place mode is click-driven; the keyboard shortcuts are select-mode only.
    if (selected) {
      return;
    }
    // Enter opens the selection's script: what double-clicking it does, from
    // the keyboard the canvas already takes the arrows from.
    if (event.key === 'Enter' && selectedId && canOpenScript) {
      event.preventDefault();
      onEditScript?.(selectedId);
      return;
    }
    // Shift+arrow NUDGES the selection rather than cycling it.
    const step = ARROW_STEPS[event.key];
    if (step && event.shiftKey && selectedId && !isReadOnly) {
      event.preventDefault();
      nudgeSelection(step.dx, step.dy, event.altKey);
      return;
    }
    // …and Alt+arrow RESIZES it, which is the same arrows with the modifier
    // Shift already took. Only for a kind that has a box; for anything else
    // the arrows go on cycling the selection.
    if (step && event.altKey && selectedId && !isReadOnly) {
      event.preventDefault();
      resizeSelection(step.dx * RESIZE_STEP, step.dy * RESIZE_STEP);
      return;
    }
    // …and the two brackets turn it. A quarter turn is six presses, which is
    // what a fifteen-degree step is for: the angles somebody wants are mostly
    // multiples of it, and the inspector has the exact number.
    if ((event.key === '[' || event.key === ']') && selectedId && !isReadOnly) {
      event.preventDefault();
      turnSelection(event.key === ']' ? TURN_STEP : -TURN_STEP);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      cycleSelection(1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      cycleSelection(-1);
      return;
    }
    if (
      !isReadOnly &&
      selectedId &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      event.preventDefault();
      deleteActor(selectedId);
    }
  };

  /**
   * Open the script of the placement under a double-click, selecting it too.
   *
   * Not while placing: there a double-click is two placements, and the second
   * click already made one. Not on empty map either, which has no script to
   * open — the map's own is the toolbar's button.
   */
  const handleDoubleClick = (event: ReactMouseEvent) => {
    if (selected || !view || !canOpenScript) {
      return;
    }
    const hit = hitUnder(screenToWorld(event.clientX, event.clientY));
    if (!hit) {
      return;
    }
    setSelectedId(hit.id);
    setInspectingLayer(false);
    onEditScript?.(hit.id);
  };

  const handleClick = (event: ReactMouseEvent) => {
    // Placement (place mode). A pan drag ends with a click; ignore it, and any
    // click with no template selected.
    if (isReadOnly || !selected || !view || panRef.current) {
      return;
    }
    const pos = snap(
      screenToWorld(event.clientX, event.clientY),
      event.altKey,
      ghostBox,
    );
    const name = selected.split('/').pop() ?? selected;
    commit({
      ...map,
      actors: [
        ...map.actors,
        withPlacementLayer(
          {
            type: selected,
            id: `${name}-${crypto.randomUUID().slice(0, 8)}`,
            properties: {positional: {position: pos}},
          },
          // On the layer the strip has selected, if the map still has it.
          layersOf(map).some(layer => layer.id === selectedLayer)
            ? selectedLayer
            : DEFAULT_LAYER,
        ),
      ],
    });
  };

  const resetView = () => {
    if (size.w > 0 && size.h > 0) {
      setView(fitView(size.w, size.h, extent));
    }
  };

  // Draw the scene through the camera transform: the outside fill, then (in world
  // space) the map region, grid, its border, the placed actors, and the ghost.
  /** What the map region is painted with, under its layers' images. */
  const skyColor = world?.header.backgroundColor?.color ?? MAP_BG;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view || size.w === 0 || size.h === 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.round(size.w * dpr);
    const bh = Math.round(size.h * dpr);
    if (canvas.width !== bw) {
      canvas.width = bw;
    }
    if (canvas.height !== bh) {
      canvas.height = bh;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = OUTSIDE_BG;
    ctx.fillRect(0, 0, bw, bh);

    // World transform (device pixels): world → scaled + offset, DPR folded in.
    const s = view.scale * dpr;
    ctx.setTransform(s, 0, 0, s, view.x * dpr, view.y * dpr);

    // The world's background color where it sets one, as the game paints
    // behind everything; the editor's own dark otherwise.
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, extent.w, extent.h);

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1 / view.scale; // ~1 CSS px regardless of zoom
    ctx.beginPath();
    for (let x = 0; x <= extent.w; x += map.tile.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, extent.h);
    }
    for (let y = 0; y <= extent.h; y += map.tile.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(extent.w, y);
    }
    ctx.stroke();

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 2 / view.scale;
    ctx.strokeRect(0, 0, extent.w, extent.h);

    // What the player will actually see: a map bigger than the window has
    // actors off screen. Drawn only when the two differ, because on a
    // window-sized map this line would sit exactly under the border and mean
    // nothing — which is the case for a one-room level that sets its view to
    // its own size, and the reason the window is a prop.
    if (extent.w !== visible.w || extent.h !== visible.h) {
      ctx.save();
      ctx.strokeStyle = VIEWPORT_EDGE;
      ctx.lineWidth = 2 / view.scale;
      ctx.setLineDash([6 / view.scale, 4 / view.scale]);
      ctx.strokeRect(0, 0, visible.w, visible.h);
      ctx.restore();
    }

    // Draw a sprite through its transform (translate → skew → rotate → scale),
    // centered on its position, so the editor shows the actor as the game will.
    // The skew is a vertical shear about the center (y' = y + tan(skew)·x),
    // inserted after the translate so it matches the Phaser driver's
    // T(pos)·shear·R·S ordering.
    /**
     * What a placement is drawn as right now: its own picture once painted,
     * the last one drawn for it while that is pending, or nothing — in which
     * case the kind's picture is the answer.
     */
    const pictureOf = (
      placement?: string,
      id?: string,
    ): Remembered<Picture> | undefined => {
      const painted = placement
        ? (pictures?.[placement] ?? images[placement])
        : undefined;
      const own =
        placement && painted
          ? {image: painted, size: placementSizes?.[placement]}
          : undefined;
      return id
        ? rememberedPicture(remembered.current, id, placement, own)
        : own;
    };
    const drawSprite = (
      type: string,
      t: Transform,
      alpha: number,
      /** This placement's own picture, where it has one — three Labels on one
       *  map say three different things (specs/UI_ACTORS.md). */
      placement?: string,
      /** Which placement, so the last picture drawn for it can stand in
       *  while a fresh one is being painted. */
      id?: string,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(t.pos.x, t.pos.y);
      if (t.skew) {
        ctx.transform(1, Math.tan(t.skew * DEG2RAD), 0, 1, 0, 0);
      }
      ctx.rotate(t.rotation * DEG2RAD);
      ctx.scale(t.scale.x, t.scale.y);
      const shown = pictureOf(placement, id);
      const image = shown?.image ?? pictures?.[type] ?? images[type];
      // Whether anything measured this: the placement itself, or its kind.
      const measured = shown?.size ?? sizes?.[type];
      const box = measured ?? sizeOf(type);
      if (image) {
        // At the DECLARED size when there is one — the placement's own where
        // it was made a size, else its kind's — so a 64-by-8 bar is two tiles
        // wide beside a 32-pixel player rather than fitted into the same
        // square as everything else. A kind that declares none falls back to
        // the nominal tile, at the thumbnail's own aspect — a sprite's
        // thumbnail is square, so nothing changes for one, and a drawn actor
        // without a size would still not be squashed (`drawingThumbnail`).
        const longest = Math.max(image.width, image.height) || 1;
        const width = measured
          ? box.width
          : (image.width / longest) * DRAW_SIZE;
        const height = measured
          ? box.height
          : (image.height / longest) * DRAW_SIZE;
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        ctx.fillStyle = '#33cc66';
        ctx.fillRect(-box.width / 2, -box.height / 2, box.width, box.height);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };
    // Outline an actor: a box hugging its sprite through the same transform the
    // sprite uses (translate → skew → rotate), so it tracks the visible shape.
    // Scale is folded into the box size, not the context, so the stroke stays a
    // constant 2 screen px at any zoom.
    const strokeActorBox = (
      t: Transform,
      color: string,
      type: string,
      placement?: string,
      id?: string,
    ) => {
      ctx.save();
      ctx.translate(t.pos.x, t.pos.y);
      if (t.skew) {
        ctx.transform(1, Math.tan(t.skew * DEG2RAD), 0, 1, 0, 0);
      }
      ctx.rotate(t.rotation * DEG2RAD);
      // The size it is drawn at, so an outline hugs what is drawn rather than
      // the square everything used to be — and the same box the hit test uses.
      const box =
        (id ? remembered.current.get(id)?.size : undefined) ??
        sizeOf(type, placement);
      const hw = (box.width * Math.abs(t.scale.x)) / 2 + 3 / view.scale;
      const hh = (box.height * Math.abs(t.scale.y)) / 2 + 3 / view.scale;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / view.scale;
      ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    };
    /**
     * The corner mark on a placement whose workspace holds blocks: a filled
     * disc at the box's top-right, ringed so it reads over any sprite. Sized
     * in screen pixels, so it stays the same size at every zoom.
     */
    const markScripted = (
      t: Transform,
      type: string,
      placement?: string,
      id?: string,
    ) => {
      ctx.save();
      ctx.translate(t.pos.x, t.pos.y);
      ctx.rotate(t.rotation * DEG2RAD);
      const box =
        (id ? remembered.current.get(id)?.size : undefined) ??
        sizeOf(type, placement);
      const hw = (box.width * Math.abs(t.scale.x)) / 2;
      const hh = (box.height * Math.abs(t.scale.y)) / 2;
      ctx.beginPath();
      ctx.arc(hw, -hh, 6 / view.scale, 0, Math.PI * 2);
      ctx.fillStyle = SCRIPT;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / view.scale;
      ctx.stroke();
      ctx.restore();
    };
    /**
     * Draw a line from the selected actor to one it names, labeled.
     *
     * DASHED, because it is a relationship and not a wall — the only other
     * lines on this canvas are the grid and the outlines, both of which are
     * things you could bump into. The label is what makes several references
     * readable: a Health Bar over a player is `subject` AND `attached to`, and
     * two identical lines would say there were two of something without
     * saying which.
     *
     * The text is drawn with a dark stroke under the fill, which is the
     * cheapest thing that stays legible over a sprite, a grid line or bare
     * background without a backing rectangle to keep aligned.
     */
    const strokeLink = (from: Vec, to: Vec, label: string) => {
      ctx.save();
      ctx.strokeStyle = REFERENCE;
      ctx.lineWidth = 1.5 / view.scale;
      ctx.setLineDash([6 / view.scale, 4 / view.scale]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${11 / view.scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.lineWidth = 3 / view.scale;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeText(label, midX, midY);
      ctx.fillStyle = REFERENCE;
      ctx.fillText(label, midX, midY);
      ctx.restore();
    };
    let selectedTransform: Transform | null = null;
    let selectedType = '';
    let selectedKey: string | undefined;
    let hoveredTransform: Transform | null = null;
    let hoveredType = '';
    let hoveredKey: string | undefined;
    const transformById = new Map<string, Transform>();
    const keyById = new Map<string, string | undefined>();
    // LAYER BY LAYER, back to front, which is how the game draws them
    // (specs/LAYERS_PLAN.md): a layer's background, then what is placed on
    // it in the document's order. A placement naming a
    // layer the map no longer has is on the default, as the engine puts it.
    const layers = layersOf(map);
    const known = new Set(layers.map(layer => layer.id));
    /** One slot's image over the map: stretched to it, or tiled across it. */
    const drawSlot = (slot: MapSlotDoc | undefined) => {
      const image = slot?.sprite ? backgroundImages?.[slot.sprite] : undefined;
      if (!slot || !image) {
        return;
      }
      const ox = slot.offset?.x ?? 0;
      const oy = slot.offset?.y ?? 0;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, extent.w, extent.h);
      ctx.clip();
      if (slot.repeat) {
        const pattern = ctx.createPattern(image, 'repeat');
        if (pattern) {
          ctx.translate(ox, oy);
          ctx.fillStyle = pattern;
          ctx.fillRect(-ox, -oy, extent.w, extent.h);
        }
      } else {
        ctx.drawImage(image, ox, oy, extent.w, extent.h);
      }
      ctx.restore();
    };
    for (const layer of layers) {
      drawSlot(layer.background);
      for (const actor of map.actors) {
        const on = known.has(layerOfPlacement(actor))
          ? layerOfPlacement(actor)
          : DEFAULT_LAYER;
        if (on !== layer.id || !positionOf(actor)) {
          continue;
        }
        // Through the parent, so a child sits where the engine will put it
        // and a dragged parent brings its children (specs/PARENTING.md).
        const t = worldTransformOf(actor, map.actors, scales);
        const key = placementKey(actor.type, actor.properties);
        drawSprite(actor.type, t, 1, key, actor.id);
        transformById.set(actor.id, t);
        keyById.set(actor.id, key);
        if (showIcons && hasScript(actor.blocks)) {
          markScripted(t, actor.type, key, actor.id);
        }
        if (actor.id === selectedId) {
          selectedTransform = t;
          selectedType = actor.type;
          selectedKey = key;
        }
        if (actor.id === hoveredId) {
          hoveredTransform = t;
          hoveredType = actor.type;
          hoveredKey = key;
        }
      }
    }
    // Hover highlight (a lighter outline), drawn under the selection outline and
    // skipped when the hovered actor is already the selected one.
    // What each Viewport holds, drawn inside its box: the held map's
    // placements at their own positions from the box's top-left corner,
    // clipped to the box and dimmed, over the Viewport's own face.
    for (const [id, held] of Object.entries(heldMaps ?? {})) {
      const t = transformById.get(id);
      const owner = map.actors.find(actor => actor.id === id);
      if (!t || !owner) {
        continue;
      }
      const box =
        remembered.current.get(id)?.size ?? sizeOf(owner.type, keyById.get(id));
      const hw = (box.width * Math.abs(t.scale.x)) / 2;
      const hh = (box.height * Math.abs(t.scale.y)) / 2;
      ctx.save();
      ctx.translate(t.pos.x, t.pos.y);
      ctx.rotate(t.rotation * DEG2RAD);
      ctx.beginPath();
      ctx.rect(-hw, -hh, hw * 2, hh * 2);
      ctx.clip();
      ctx.translate(-hw, -hh);
      for (const inside of held.actors) {
        if (!positionOf(inside)) {
          continue;
        }
        drawSprite(
          inside.type,
          worldTransformOf(inside, held.actors, scales),
          0.45,
          placementKey(inside.type, inside.properties),
        );
      }
      ctx.restore();
    }
    if (hoveredTransform && hoveredId !== selectedId) {
      // While POINTING a reference, the hover says what the click will choose
      // rather than what it will select — so it wears the reference color,
      // which is the color the line to it will be.
      strokeActorBox(
        hoveredTransform,
        picking ? REFERENCE : HOVER,
        hoveredType,
        hoveredKey,
        hoveredId ?? undefined,
      );
    }
    // What the selected actor POINTS AT, before its own outline so that an
    // actor which is both selected and referenced reads as selected.
    //
    // A reference is otherwise invisible: the value is a name in a panel, and
    // the actor it names may be scrolled off the canvas. Drawing it is the
    // whole reason a map can hold one.
    if (selectedActor && selectedTransform) {
      for (const link of linksFrom(selectedActor, selectedSchema, map.actors)) {
        const target = transformById.get(link.targetId);
        if (!target) {
          continue; // named, but nowhere on the canvas to point at
        }
        strokeActorBox(
          target,
          REFERENCE,
          map.actors.find(one => one.id === link.targetId)?.type ?? '',
          keyById.get(link.targetId),
          link.targetId,
        );
        strokeLink(selectedTransform.pos, target.pos, link.name);
      }
    }
    if (selectedTransform) {
      strokeActorBox(
        selectedTransform,
        SELECT,
        selectedType,
        selectedKey,
        selectedId ?? undefined,
      );
      // …and the eight grips, on a kind that has a box to grab. Drawn in
      // SCREEN pixels so they stay the same size to grab at any zoom, and
      // placed by the same `handlePoint` the press hit-tests with, so what is
      // drawn and what is grabbable cannot drift apart (specs/BOXES_PLAN.md).
      const grips = selectedBox && selectedId ? handlesOf(selectedBox) : [];
      for (const {at} of grips) {
        const size = HANDLE_SIZE / view.scale;
        ctx.fillStyle = MAP_BG;
        ctx.strokeStyle = SELECT;
        ctx.lineWidth = 2 / view.scale;
        ctx.beginPath();
        ctx.rect(at.x - size / 2, at.y - size / 2, size, size);
        ctx.fill();
        ctx.stroke();
      }
      if (selectedBox && selectedId) {
        // …and the turn grip, beyond the top edge, on a stalk so it reads as
        // apart from the corners rather than as a ninth resize.
        const top = handlePoint(selectedBox, 'top');
        const grip = rotationPoint(selectedBox, TURN_REACH / view.scale);
        ctx.strokeStyle = SELECT;
        ctx.lineWidth = 2 / view.scale;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(grip.x, grip.y);
        ctx.stroke();
        ctx.fillStyle = MAP_BG;
        ctx.beginPath();
        ctx.arc(grip.x, grip.y, HANDLE_SIZE / view.scale / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    if (selected && hover) {
      drawSprite(
        selected,
        {pos: hover, scale: {x: 1, y: 1}, rotation: 0, skew: 0},
        0.5,
      );
    }
  }, [
    view,
    size,
    map,
    images,
    hover,
    selected,
    selectedId,
    hoveredId,
    sizes,
    scales,
    // The links are read through the schema, so a schema arriving from the
    // sandbox after the first paint has to repaint.
    selectedActor,
    selectedSchema,
    // …and the hover changes color while a reference is being pointed.
    picking,
    // The world may say how much of itself is on screen while this is open.
    visible,
    // …and the corner marks come and go with their toggle.
    showIcons,
    // …and what each Viewport holds, which changes with the files.
    heldMaps,
    // …and a slot's image, which arrives decoded after the first paint.
    backgroundImages,
    // …and the world's background color.
    skyColor,
  ]);

  const canvasClass = [
    styles.canvas,
    // Pointing borrows the crosshair, which is the one cursor that already
    // means "this click is a choice, not a grab".
    picking ? styles.picking : '',
    panning
      ? styles.panning
      : selected
        ? styles.placing
        : hoveredId
          ? styles.hovering
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // THE MAP'S BACKGROUND is its back layer's — the one `set background to`
  // sets — offered in the inspector with nothing selected, so that a map has
  // a background without the Layers panel having to be found first.
  const backLayer = layersOf(map)[0];
  const backgroundProps = {
    background: backLayer.background,
    backgrounds: backgroundChoices ?? [],
    onBackground: (change: Partial<MapSlotDoc>) =>
      commit(withBackground(mapRef.current, backLayer.id, change)),
  };

  // The selection's Script button, floated just outside its top-right corner
  // (`stageGeometry.scriptButtonAt`). Around the box the grips are drawn on,
  // or for a kind with none, the outline drawn around what it looks like.
  const scriptButton = (() => {
    if (!selectedActor || !view || !canOpenScript || selected) {
      return undefined;
    }
    const at = worldTransformOf(selectedActor, map.actors, scales);
    const drawn = sizeOf(selectedActor.type);
    const box: Box = selectedBox ?? {
      center: at.pos,
      width: drawn.width * Math.abs(at.scale.x),
      height: drawn.height * Math.abs(at.scale.y),
      rotation: at.rotation,
    };
    const corners = (
      ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
    ).map(corner => worldToScreen(view, handlePoint(box, corner)));
    return scriptButtonAt(corners, SCRIPT_BUTTON, size, SCRIPT_BUTTON_GAP);
  })();

  // Only when a script can be opened, because opening it is the one thing
  // the camera list offers — and not at all while scripts are withheld from
  // this lesson: a list whose one button opens a script nobody may open is a
  // list that says less than nothing.
  //
  // …except the world's own, which are EDITED in the strip and need no
  // script to be offered (`worldCameraCode`).
  const scripts = !appBuilder && onEditScript && !locked('map-scripts');
  // A SELECTED VIEWPORT'S cameras are edited as the world's are, through the
  // same strip and inspector — but they are data on the placement, made here
  // and nowhere else, which the compiler turns into their declarations
  // (`blockly/placementCameras`). Its `shows through` says which it looks
  // through, by name.
  const isViewport = selectedSchema.some(
    group => group.trait === VIEWPORT.trait,
  );
  const viewportCameraEditor: WorldCameraEditor | undefined =
    selectedActor && isViewport && cameraChoices
      ? (() => {
          const actor = selectedActor;
          const stored = actor.cameras ?? [];
          const named = (id: string) => stored.find(camera => camera.id === id);
          return {
            starting:
              stored.find(camera => camera.name === showsThroughOf(actor))
                ?.id ?? MAIN_CAMERA,
            choices: cameraChoices,
            traitsOf: id => named(id)?.traits ?? [],
            valueOf: (id, property) =>
              named(id)?.values.find(each => each.setter === property.setter)
                ?.value,
            add: () => {
              const made = addPlacementCamera(mapRef.current, actor.id);
              commit(made.doc);
              return made.id;
            },
            remove: id =>
              commit(removePlacementCamera(mapRef.current, actor.id, id)),
            rename: (id, name) =>
              commit(renamePlacementCamera(mapRef.current, actor.id, id, name)),
            setStarting: id =>
              commit(
                withShowsThrough(
                  mapRef.current,
                  actor.id,
                  id === MAIN_CAMERA ? '' : (named(id)?.name ?? ''),
                ),
              ),
            setTrait: (id, trait, elected) =>
              commit(
                withPlacementCameraTrait(
                  mapRef.current,
                  actor.id,
                  id,
                  trait,
                  elected,
                ),
              ),
            setValue: (id, property, value) =>
              commit(
                withPlacementCameraValue(mapRef.current, actor.id, id, {
                  setter: property.setter,
                  type: property.type,
                  value,
                }),
              ),
          };
        })()
      : undefined;
  /** Whose cameras the strip and inspector edit: a Viewport's, or the world's. */
  const cameraEditor = selectedActor ? viewportCameraEditor : worldCameraEditor;
  // Made here and kept as data: a Viewport's on its placement, the world's on
  // its main map. Cameras declared in code beside them are listed, not edited.
  const editableCameras: readonly DeclaredCamera[] = (
    (selectedActor ? selectedActor.cameras : map.cameras) ?? []
  ).map(({id, name, traits}) => ({id, name, traits}));
  const cameras = appBuilder
    ? undefined
    : selectedActor
      ? viewportCameraEditor
        ? {
            list: editableCameras,
            inCode: placementCameras(selectedActor.blocks),
            owner: selectedActor.id,
            open: scripts ? () => onEditScript?.(selectedActor.id) : undefined,
          }
        : scripts
          ? {
              list: placementCameras(selectedActor.blocks),
              inCode: [],
              owner: selectedActor.id,
              open: () => onEditScript?.(selectedActor.id),
            }
          : undefined
      : world && (worldCameraEditor || scripts)
        ? {
            // Edited here, the stored ones with the code's beside them;
            // otherwise only what the code declares, to open.
            list: worldCameraEditor ? editableCameras : (worldCameras ?? []),
            inCode: worldCameraEditor ? (worldCameras ?? []) : [],
            owner: 'the world',
            open: scripts ? () => onEditScript?.(undefined) : undefined,
          }
        : undefined;
  /** The camera open in the inspector, while it still exists. */
  const inspectedCamera =
    cameraEditor && inspectingCamera
      ? inspectingCamera === MAIN_CAMERA
        ? {id: MAIN_CAMERA, name: 'Main camera'}
        : editableCameras.find(each => each.id === inspectingCamera)
      : undefined;

  return (
    <div className={styles.stage} ref={stageRef}>
      <canvas
        ref={canvasRef}
        className={canvasClass}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endGesture}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        /*
         * APPLICATION, though the rule below calls that a non-interactive role
         * on an interactive element. It is the honest one and the same one the
         * running game's element carries (`runtime/driver/PhaserBinding`): this
         * stage takes the arrow keys, and a screen reader left in browse mode
         * would eat every one of them before it arrived.
         */
        // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
        role="application"
        aria-label={
          'Map. Arrow keys move between the actors on it. Shift and an arrow ' +
          'moves the selected one, Alt and an arrow resizes it, and the ' +
          'square brackets turn it. Enter opens its code, and Delete ' +
          'removes it.'
        }
      />
      <div
        className={styles.announcer}
        aria-live="polite"
        role="status"
        data-testid="stage-announcer"
      >
        {announcement}
      </div>
      {scriptButton && selectedActor && (
        // HTML rather than drawn, so it can be focused, read and pointed at
        // by a lesson, none of which a picture on a canvas can be. White and
        // raised, since it sits on whatever the map is painted with; the
        // blocks icon every way into code wears, as the inspector's has.
        <Tooltip title={`Open the code of ${selectedActor.id}`}>
          <IconButton
            className={styles.scriptFloat}
            variant="contained"
            color="white"
            size="extraSmall"
            style={{left: scriptButton.x, top: scriptButton.y}}
            aria-label={`Open the code of ${selectedActor.id}`}
            onClick={() => onEditScript?.(selectedActor.id)}
          >
            <FontAwesomeV6Icon iconName="puzzle-piece" iconStyle="solid" />
          </IconButton>
        </Tooltip>
      )}
      <div className={styles.toolbar}>
        <Typography variant="body4" component="span" className={styles.zoom}>
          {view ? `${Math.round(view.scale * 100)}%` : '—'}
        </Typography>
        <ToolbarIcon label="Reset view" icon="expand" onClick={resetView} />
        {onEditScript && (
          // Only with scripts to show or hide: the marks are about them. It
          // works whether or not scripts are withheld, since the marks are
          // drawn either way: they say what the file holds.
          <ToolbarIcon
            label="Code marks"
            icon="code"
            pressed={showIcons}
            onClick={() => setShowIcons(shown => !shown)}
          />
        )}
        {!appBuilder && (
          <ToolbarIcon
            label="Layers"
            icon="layer-group"
            pressed={panels.layers}
            onClick={() => togglePanel('layers')}
          />
        )}
        {cameras && (
          <ToolbarIcon
            label="Cameras"
            icon="video"
            pressed={panels.cameras}
            onClick={() => togglePanel('cameras')}
          />
        )}
        {onEditScript && (
          <>
            <ToolbarIcon
              label={mapScriptLabel}
              icon="puzzle-piece"
              className={withheldClass('map-scripts')}
              {...orWithheld('map-scripts', 'toolbar', () =>
                onEditScript(undefined),
              )}
            />
            {note('map-scripts', 'toolbar')}
          </>
        )}
      </div>
      <div className={styles.panels}>
        {!appBuilder &&
          panels.layers &&
          (locked('map-layers') ? (
            // The strip's place, kept: a list nobody can use yet is still where
            // layers will be, and says which lesson brings them.
            <div className={styles.layers} data-testid="layer-panel-locked">
              <Typography variant="subtitle2" component="span">
                Layers
              </Typography>
              {note('map-layers', 'strip')}
            </div>
          ) : (
            <LayerPanel
              layers={layersOf(map)}
              selected={selectedLayer}
              onSelect={id => {
                setSelectedLayer(id);
                setInspectingLayer(true);
                setInspectingCamera(null);
                setSelectedId(null);
              }}
              onAdd={() => {
                const made = addLayer(mapRef.current);
                commit(made.doc);
                setSelectedLayer(made.id);
                setInspectingLayer(true);
                setSelectedId(null);
              }}
              onRemove={id => {
                commit(removeLayer(mapRef.current, id));
                setSelectedLayer(DEFAULT_LAYER);
              }}
              onMove={(id, by) => commit(moveLayer(mapRef.current, id, by))}
              isReadOnly={isReadOnly}
            />
          ))}
        {/* The cameras of whatever is being edited: the world's on a main map
            with nothing selected, a placement's when one is — and nothing on
            a level `.map` with nothing selected, since a map has none
            (specs/SPACE_CAMERAS_PLAN.md). */}
        {panels.cameras && cameras && (
          <CameraPanel
            cameras={cameras.list}
            owner={cameras.owner}
            onOpen={cameras.open}
            inCode={cameras.inCode}
            edits={
              cameraEditor
                ? {
                    selected: inspectedCamera?.id ?? null,
                    starting: cameraEditor.starting,
                    onSelect: id => {
                      setInspectingCamera(id);
                      setInspectingLayer(false);
                    },
                    onAdd: () => {
                      const id = cameraEditor.add();
                      if (id) {
                        setInspectingCamera(id);
                        setInspectingLayer(false);
                      }
                    },
                    onRemove: id => {
                      cameraEditor.remove(id);
                      setInspectingCamera(null);
                    },
                    isReadOnly,
                  }
                : undefined
            }
          />
        )}
        <RecordPanel
          records={records}
          kinds={recordKinds}
          selected={selectedId}
          onSelect={id => {
            setSelectedId(id);
            setInspectingLayer(false);
          }}
          onAdd={addRecord}
          onRemove={deleteActor}
          isReadOnly={isReadOnly}
          nameOf={kindName}
        />
      </div>
      {inspectedCamera && cameraEditor && (
        <CameraInspector
          // Re-keyed on what the code says of it, so a change from outside —
          // and a different camera — is what the fields show.
          key={`${inspectedCamera.id}:${inspectedCamera.name}:${cameraEditor.starting}`}
          id={inspectedCamera.id}
          name={inspectedCamera.name}
          starting={cameraEditor.starting === inspectedCamera.id}
          traits={cameraEditor.traitsOf(inspectedCamera.id)}
          choices={cameraEditor.choices}
          valueOf={property =>
            cameraEditor.valueOf(inspectedCamera.id, property)
          }
          kinds={Object.entries(kinds ?? {})
            .map(([path, kind]) => [kind.name, path] as const)
            .sort(([a], [b]) => a.localeCompare(b))}
          onRename={name => cameraEditor.rename(inspectedCamera.id, name)}
          onStarting={() => cameraEditor.setStarting(inspectedCamera.id)}
          onTrait={(trait, elected) =>
            cameraEditor.setTrait(inspectedCamera.id, trait, elected)
          }
          onValue={(property, value) =>
            cameraEditor.setValue(inspectedCamera.id, property, value)
          }
          onClose={() => setInspectingCamera(null)}
          looker={selectedActor ? 'This Viewport' : 'The world'}
          // The world's main camera takes traits, stored on its main map; a
          // Viewport's has its kind's.
          mainTakesTraits={!selectedActor}
          mainNote={
            selectedActor
              ? 'This Viewport’s own camera. What it follows is set in the ' +
                'Viewport’s properties; add a camera for another view.'
              : undefined
          }
          isReadOnly={isReadOnly}
        />
      )}
      {!selectedActor && inspectingLayer && inspectedLayer && (
        <LayerInspector
          // Re-keyed on what the document says, so a change from outside —
          // and a different layer — is what the fields show.
          key={JSON.stringify(inspectedLayer)}
          layer={inspectedLayer}
          backgrounds={backgroundChoices ?? []}
          onChange={change =>
            commit(withLayer(mapRef.current, inspectedLayer.id, change))
          }
          onBackground={change =>
            commit(withBackground(mapRef.current, inspectedLayer.id, change))
          }
          onClose={() => setInspectingLayer(false)}
          isReadOnly={isReadOnly}
        />
      )}
      {!selectedActor &&
        !(inspectingLayer && inspectedLayer) &&
        !inspectedCamera &&
        world && (
          <WorldInspector
            // NOT re-keyed on the header, though that is the obvious way to
            // make a change from outside show: a remount closes the rule
            // groups and the vector popover, and a drag on the grid commits
            // on every move. The inspector follows the header itself.
            {...world}
            // …and the theme, which is the WORLD's — its `use theme` row — and
            // so its main map's: there is no difference to keep between them.
            theme={world.header.theme}
            themeOptions={themeOptions}
            onTheme={path => world.onTheme?.(path)}
            {...backgroundProps}
            isReadOnly={isReadOnly}
          />
        )}
      {!selectedActor &&
        !(inspectingLayer && inspectedLayer) &&
        !inspectedCamera &&
        !world && (
          <MapInspector
            modal={map.modal === true}
            // `undefined` and not `false` for the off state: every map written
            // before modality existed says nothing, and writing `false` into all
            // of them would be a diff per map for no change in meaning
            // (specs/MODALITY_PLAN.md).
            onModal={modal =>
              commit({...mapRef.current, modal: modal || undefined})
            }
            theme={map.theme}
            themeOptions={themeOptions}
            onTheme={path => commit({...mapRef.current, theme: path})}
            {...backgroundProps}
            isReadOnly={isReadOnly}
          />
        )}
      {/* `fields.narrow` below is what makes the design system's form widths
          fit a panel this size — see `formFields.module.css`, which says what
          the overrides are for and what each one was found by. */}
      {selectedActor && !inspectedCamera && (
        <div className={`${styles.inspector} ${fields.narrow}`}>
          <div className={styles.inspectorHead}>
            <Typography variant="subtitle2" component="span">
              {selectedActor.type.split('/').pop()}
            </Typography>
            {/* The four things to do from here, as the icons they wear
                elsewhere (`IconAction`). This placement's own code first;
                then the two about its KIND, whose words still say which kind,
                since a tick in Enhance or a block in its file changes every
                one of them; and Delete last, apart. */}
            <div className={styles.inspectorActions}>
              {onEditScript && (
                <IconAction
                  label="Code"
                  icon="puzzle-piece"
                  className={withheldClass('map-scripts')}
                  data-callout="map.script"
                  {...orWithheld('map-scripts', 'inspector', () =>
                    onEditScript(selectedActor.id),
                  )}
                />
              )}
              {canOpenScript && eventsFor && (
                // A section for THIS actor, started from the event it
                // answers: the quick way to its own code, for the events
                // its kind can actually hear (`blockly/eventChoices`).
                <IconAction
                  label="Add an event"
                  icon="bolt"
                  onClick={event => setEventMenu(event.currentTarget)}
                />
              )}
              {selectedKind && onEnhanceKind && (
                <IconAction
                  label={`Enhance ${selectedKind.name}…`}
                  icon="sparkles"
                  disabled={isReadOnly}
                  className={withheldClass('map-enhance')}
                  data-callout="map.enhance"
                  {...orWithheld('map-enhance', 'inspector', () =>
                    onEnhanceKind(selectedActor.type),
                  )}
                />
              )}
              {selectedKind && onOpenKind && (
                <IconAction
                  label={`Open ${selectedKind.name}`}
                  icon="arrow-up-right-from-square"
                  className={withheldClass('map-open-kind')}
                  data-callout="map.openKind"
                  {...orWithheld('map-open-kind', 'inspector', () =>
                    onOpenKind(selectedActor.type),
                  )}
                />
              )}
              <IconAction
                label="Delete"
                icon="trash"
                className={styles.inspectorDelete}
                onClick={() => deleteActor(selectedActor.id)}
                disabled={isReadOnly}
              />
              {eventMenu && eventsFor && selectedActor && (
                <Menu
                  open
                  anchorEl={eventMenu}
                  onClose={() => setEventMenu(null)}
                  slotProps={{paper: {style: {maxHeight: 420}}}}
                >
                  {eventRows(eventsFor(selectedActor.type), type => {
                    setEventMenu(null);
                    commit({
                      ...mapRef.current,
                      actors: mapRef.current.actors.map(actor =>
                        actor.id === selectedActor.id
                          ? withEventHandler(actor, type)
                          : actor,
                      ),
                    });
                    onEditScript?.(selectedActor.id);
                  })}
                </Menu>
              )}
            </div>
          </div>
          {/* What a withheld one says about the lesson that brings it, under
              the row rather than inside it. */}
          {onEditScript && note('map-scripts', 'inspector')}
          {selectedKind && onEnhanceKind && note('map-enhance', 'inspector')}
          {selectedKind && onOpenKind && note('map-open-kind', 'inspector')}
          <TextField
            name="actor-id"
            label="ID"
            size="s"
            value={draft.id ?? ''}
            disabled={isReadOnly}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              editId(event.target.value)
            }
            onBlur={applyRename}
            onKeyDown={blurOnEnter}
          />
          {/*
           * WHICH EDGE IT KEEPS ITS DISTANCE FROM, when this map is loaded
           * into a window that is not its own shape — a menu over a square
           * level and over a phone-shaped one (specs/ANCHORS_PLAN.md).
           * Beside the layer dropdown because it is the same kind of fact:
           * not what the thing IS, but where in an arrangement it sits.
           *
           * "Anchored to" rather than "Holds on to", which was oblique out of
           * context and was the one place in the lab not using the word the
           * spec, the engine and the property all use.
           */}
          <SimpleDropdown
            name="actor-anchor"
            labelText="Anchored to"
            size="s"
            className={styles.inspectorDropdown}
            disabled={isReadOnly}
            selectedValue={selectedActor.anchor ?? ''}
            items={[
              {value: '', text: 'nothing'},
              ...ANCHORS.map(anchor => ({value: anchor, text: anchor})),
            ]}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              commit({
                ...mapRef.current,
                actors: mapRef.current.actors.map(actor =>
                  actor.id === selectedActor.id
                    ? withPlacementAnchor(actor, event.target.value)
                    : actor,
                ),
              })
            }
          />
          {!appBuilder && !locked('map-layers') && layersOf(map).length > 1 && (
            <SimpleDropdown
              name="actor-layer"
              labelText="Layer"
              size="s"
              className={styles.inspectorDropdown}
              disabled={isReadOnly}
              selectedValue={layerOfPlacement(selectedActor)}
              items={[...layersOf(map)].reverse().map(layer => ({
                value: layer.id,
                text: layerName(layer),
              }))}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                commit({
                  ...mapRef.current,
                  actors: mapRef.current.actors.map(actor =>
                    actor.id === selectedActor.id
                      ? withPlacementLayer(actor, event.target.value)
                      : actor,
                  ),
                })
              }
            />
          )}
          {selectedSchema.length > 0 && (
            <Accordion
              className={styles.inspectorAccordion}
              items={selectedSchema.map(group => ({
                id: group.trait,
                label: group.traitName,
                content: (
                  <div className={styles.inspectorGroup}>
                    {group.props.map(prop => renderProp(selectedActor, prop))}
                  </div>
                ),
              }))}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MapStage;
