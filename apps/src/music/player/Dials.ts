import {PanelElement, PanelElementVariant} from '../redux/musicRedux';

export default class Dials {
  // Used by advanced panel.
  getPanelElements: () => PanelElement[];
  setPanelElements: (panelElements: PanelElement[]) => void;

  constructor(
    getPanelElements: () => PanelElement[],
    setPanelElements: (panelElements: PanelElement[]) => void
  ) {
    //this.panelElements = [];

    this.getPanelElements = getPanelElements;
    this.setPanelElements = setPanelElements;

    this.createOutput('points', 0, 0);
    this.createInput('slide1', 'slider', 1, 0);
    this.createInput('slide2', 'knob', 2, 0);
  }

  //createInput("intensity-slider", "slider", 2, 0);
  createInput(
    id: string,
    variant: PanelElementVariant,
    row: number,
    col: number
  ) {
    const panelElements = this.getPanelElements();
    const panelElementsCopy: PanelElement[] = JSON.parse(
      JSON.stringify(panelElements)
    );
    panelElementsCopy.push({
      id,
      type: 'input',
      variant,
      row,
      col,
      currentValue: 0,
    });
    this.setPanelElements(panelElementsCopy);
  }

  //getInputValue("intensity-slider");
  getInputValue(id: string): number {
    const panelElements = this.getPanelElements();
    return panelElements.find(element => element.id === id)?.currentValue || 0;
  }

  //createOutput("counter", 4, 2);
  createOutput(id: string, row: number, col: number) {
    const panelElements = this.getPanelElements();
    const panelElementsCopy: PanelElement[] = JSON.parse(
      JSON.stringify(panelElements)
    );
    panelElementsCopy.push({
      id,
      type: 'output',
      row,
      col,
      currentValue: 0,
    });
    this.setPanelElements(panelElementsCopy);
  }

  //setOutputValue("counter", 12);
  setOutputValue(id: string, value: number) {
    const panelElements = this.getPanelElements();
    const panelElementsCopy: PanelElement[] = JSON.parse(
      JSON.stringify(panelElements)
    );
    const element = panelElementsCopy.find(element => element.id === id);
    if (element) {
      element.currentValue = value;
    }
    this.setPanelElements(panelElementsCopy);
  }

  //getOutputValue("counter");
  getOutputValue(id: string, value: number) {
    const panelElements = this.getPanelElements();
    return panelElements.find(element => element.id === id)?.currentValue;
  }

  //createSticker("logo", 6, 3, 30);
  createSticker(id: string, row: number, col: number, angle: number) {
    const panelElements = this.getPanelElements();
    const panelElementsCopy: PanelElement[] = JSON.parse(
      JSON.stringify(panelElements)
    );
    panelElementsCopy.push({
      id,
      type: 'sticker',
      row,
      col,
      currentValue: 0,
    });
    this.setPanelElements(panelElementsCopy);
  }
}
