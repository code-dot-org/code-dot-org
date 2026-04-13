import {
  isExcalidrawSource,
  migrateExcalidrawToReactFlow,
} from '@cdo/apps/sketchlab/reactflow/utils/excalidrawToReactFlow';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

// Each case below corresponds to a behaviour we want the Excalidraw →
// React-Flow migration to get right; the "hello -> there" case mirrors the
// screenshot that first motivated this code.
describe('excalidrawToReactFlow', () => {
  describe('isExcalidrawSource', () => {
    it('recognises an object with an elements array', () => {
      expect(isExcalidrawSource({elements: [], appState: {}})).to.be.true;
    });

    it('rejects a React-Flow source (has nodes array)', () => {
      expect(isExcalidrawSource({nodes: [], edges: []})).to.be.false;
    });

    it('rejects non-objects', () => {
      expect(isExcalidrawSource(null)).to.be.false;
      expect(isExcalidrawSource(undefined)).to.be.false;
      expect(isExcalidrawSource('hello')).to.be.false;
    });
  });

  describe('migrateExcalidrawToReactFlow', () => {
    it('converts a rectangle with bound text into a single textBox node', () => {
      const source = {
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 100,
            y: 50,
            width: 300,
            height: 120,
            backgroundColor: 'transparent',
            boundElements: [{id: 'text1', type: 'text'}],
          },
          {
            id: 'text1',
            type: 'text',
            x: 150,
            y: 80,
            width: 80,
            height: 40,
            text: 'hello',
            containerId: 'rect1',
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes).to.have.length(1);
      expect(result.nodes?.[0].id).to.equal('rect1');
      expect(result.nodes?.[0].type).to.equal('textBox');
      expect(result.nodes?.[0].position).to.deep.equal({x: 100, y: 50});
      expect(result.nodes?.[0].data).to.include({
        text: 'hello',
        shape: 'rectangle',
      });
      // Excalidraw's "transparent" means "no fill, stroke still visible" —
      // which in our palette maps to the default (null) colour, not the
      // all-invisible 'transparent' entry.
      expect(result.nodes?.[0].data).to.not.have.property('color');
      // We intentionally strip Excalidraw's width/height on shape elements.
      // The React-Flow lab uses a single fixed size for every shape; carrying
      // the source dimensions through would desync the React-Flow wrapper
      // from the visible element and break handle hit-testing.
      expect(result.nodes?.[0].style).to.be.undefined;
    });

    it('does not carry Excalidraw dimensions through for circle/triangle either', () => {
      const source = {
        elements: [
          {id: 'c', type: 'ellipse', x: 0, y: 0, width: 200, height: 200},
          {id: 't', type: 'diamond', x: 0, y: 0, width: 140, height: 140},
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      const circle = result.nodes?.find(n => n.id === 'c');
      const triangle = result.nodes?.find(n => n.id === 't');
      expect(circle?.style).to.be.undefined;
      expect(triangle?.style).to.be.undefined;
    });

    it('snaps a background colour to the closest palette swatch by hue', () => {
      // `#a5d8ff` is a pale blue that Excalidraw ships as its default blue
      // fill. Our palette Blue is `#1a2e72` (much darker, same hue family).
      // Hue-based snapping should pick Blue despite the brightness difference.
      const source = {
        elements: [
          {
            id: 'r',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            backgroundColor: '#a5d8ff',
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes?.[0].data).to.include({color: '#1a2e72'});
    });

    it('snaps a light-green background to the palette Green swatch', () => {
      // `#b2f2bb` is Excalidraw's light-green swatch; palette Green is #1e5c30.
      const source = {
        elements: [
          {
            id: 'r',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            backgroundColor: '#b2f2bb',
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes?.[0].data).to.include({color: '#1e5c30'});
    });

    it('maps near-grayscale backgrounds to the default (no palette match)', () => {
      const source = {
        elements: [
          {
            id: 'r',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            backgroundColor: '#c0c0c0',
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes?.[0].data).to.not.have.property('color');
    });

    it('converts an ellipse into a circle textBox and diamond into a triangle', () => {
      const source = {
        elements: [
          {
            id: 'circ',
            type: 'ellipse',
            x: 0,
            y: 0,
            width: 200,
            height: 200,
          },
          {
            id: 'tri',
            type: 'diamond',
            x: 300,
            y: 0,
            width: 140,
            height: 140,
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes).to.have.length(2);
      expect(result.nodes?.[0].data).to.include({shape: 'circle'});
      expect(result.nodes?.[1].data).to.include({shape: 'triangle'});
    });

    it('preserves an arrow between two shapes as an edge', () => {
      const source = {
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
          {
            id: 'circ1',
            type: 'ellipse',
            x: 200,
            y: 0,
            width: 80,
            height: 80,
          },
          {
            id: 'arrow1',
            type: 'arrow',
            x: 100,
            y: 25,
            width: 100,
            height: 0,
            startBinding: {elementId: 'rect1'},
            endBinding: {elementId: 'circ1'},
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.edges).to.have.length(1);
      expect(result.edges?.[0]).to.deep.include({
        id: 'arrow1',
        source: 'rect1',
        target: 'circ1',
      });
    });

    it('resolves arrow bindings that target a bound text element to its container', () => {
      // Excalidraw occasionally records an arrow endpoint as bound to the
      // text element inside a shape rather than the shape itself. The edge
      // still needs to connect to the React-Flow shape.
      const source = {
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
          {
            id: 'text1',
            type: 'text',
            x: 10,
            y: 10,
            width: 80,
            height: 30,
            text: 'hi',
            containerId: 'rect1',
          },
          {
            id: 'circ1',
            type: 'ellipse',
            x: 200,
            y: 0,
            width: 80,
            height: 80,
          },
          {
            id: 'arrow1',
            type: 'arrow',
            x: 100,
            y: 25,
            width: 100,
            height: 0,
            startBinding: {elementId: 'text1'}, // bound to the text, not the rect
            endBinding: {elementId: 'circ1'},
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.edges).to.have.length(1);
      expect(result.edges?.[0]).to.deep.include({
        source: 'rect1',
        target: 'circ1',
      });
    });

    it('drops arrows with no bindings on at least one end', () => {
      const source = {
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
          {
            id: 'arrow1',
            type: 'arrow',
            x: 100,
            y: 25,
            width: 100,
            height: 0,
            startBinding: {elementId: 'rect1'},
            endBinding: null, // user drew the arrow to empty space
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.edges).to.have.length(0);
    });

    it('skips deleted elements', () => {
      const source = {
        elements: [
          {
            id: 'rect1',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            isDeleted: true,
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes).to.have.length(0);
    });

    it('converts a standalone text element into a rectangle textBox', () => {
      const source = {
        elements: [
          {
            id: 'text1',
            type: 'text',
            x: 50,
            y: 60,
            width: 120,
            height: 30,
            text: 'floating',
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes).to.have.length(1);
      expect(result.nodes?.[0].data).to.include({
        text: 'floating',
        shape: 'rectangle',
      });
    });

    it('carries appState scroll/zoom through to the React-Flow viewport', () => {
      const source = {
        elements: [],
        appState: {scrollX: 123, scrollY: -45, zoom: {value: 0.75}},
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.viewport).to.deep.equal({x: 123, y: -45, zoom: 0.75});
    });

    it("reproduces the 'hello -> there' screenshot scenario correctly", () => {
      // A rectangle with "hello" bound inside it, a circle with "there"
      // bound inside it, and an arrow connecting them. Before the fix this
      // produced 4 stray nodes and no edge.
      const source = {
        elements: [
          {
            id: 'rect',
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 650,
            height: 290,
          },
          {
            id: 'helloText',
            type: 'text',
            x: 275,
            y: 135,
            width: 100,
            height: 20,
            text: 'hello',
            containerId: 'rect',
          },
          {
            id: 'circ',
            type: 'ellipse',
            x: 900,
            y: 50,
            width: 290,
            height: 290,
          },
          {
            id: 'thereText',
            type: 'text',
            x: 1020,
            y: 185,
            width: 100,
            height: 20,
            text: 'there',
            containerId: 'circ',
          },
          {
            id: 'arrow',
            type: 'arrow',
            x: 650,
            y: 145,
            width: 250,
            height: 50,
            startBinding: {elementId: 'rect'},
            endBinding: {elementId: 'circ'},
          },
        ],
      };

      const result = migrateExcalidrawToReactFlow(source);

      expect(result.nodes).to.have.length(2);
      const rect = result.nodes?.find(n => n.id === 'rect');
      const circ = result.nodes?.find(n => n.id === 'circ');
      expect(rect?.data).to.include({text: 'hello', shape: 'rectangle'});
      expect(circ?.data).to.include({text: 'there', shape: 'circle'});

      expect(result.edges).to.have.length(1);
      expect(result.edges?.[0]).to.deep.include({
        source: 'rect',
        target: 'circ',
      });
    });
  });
});
