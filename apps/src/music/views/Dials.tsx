import React from 'react';
import {KnobHeadless} from 'react-knob-headless';

import Slider from '@cdo/apps/componentLibrary/slider/Slider';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PanelElement, setPanelElements} from '../redux/musicRedux';

import moduleStyles from './dials.module.scss';
interface DialsProps {}

const Dials: React.FunctionComponent<DialsProps> = () => {
  const dispatch = useAppDispatch();

  const panelElements = useAppSelector(state => state.music.panelElements);

  const getInputValue = (id: string) => {
    return panelElements?.find(element => element.id === id)?.currentValue || 0;
  };

  const setInputValue = (id: string, value: number) => {
    const panelElementsCopy: PanelElement[] = JSON.parse(
      JSON.stringify(panelElements)
    );
    const element: PanelElement | undefined = panelElementsCopy?.find(
      element => element.id === id
    );
    if (element) {
      element.currentValue = value;
      dispatch(setPanelElements(panelElementsCopy));
    }
  };

  return (
    <div id="dials" className={moduleStyles.dialsContainer}>
      {panelElements?.map(panelElement =>
        panelElement.type === 'output' ? (
          <div>{`${panelElement.id}: ${panelElement.currentValue}`}</div>
        ) : panelElement.type === 'input' &&
          panelElement.variant === 'slider' ? (
          <div>
            {panelElement.id}:
            <Slider
              name="slider"
              minValue={0}
              maxValue={2}
              step={1}
              value={getInputValue(panelElement.id)}
              onChange={event => {
                setInputValue(panelElement.id, +event.target.value);
              }}
              hideValue={false}
              color="aqua"
              className={moduleStyles.slider}
            />
          </div>
        ) : panelElement.type === 'input' && panelElement.variant === 'knob' ? (
          <div>
            {panelElement.id}:
            <KnobHeadless
              aria-label="A Knob"
              valueRaw={getInputValue(panelElement.id)}
              valueMin={0}
              valueMax={2}
              dragSensitivity={0.006}
              valueRawRoundFn={Math.round}
              valueRawDisplayFn={(valueRaw: number): string =>
                `${Math.round(valueRaw)}%`
              }
              onValueRawChange={(newValueRaw: number) => {
                console.log(newValueRaw);
                setInputValue(panelElement.id, newValueRaw);
              }}
              className="relative w-16 h-16 outline-none"
            >
              <div>
                <div
                  style={{rotate: `${getInputValue(panelElement.id) * 180}deg`}}
                  className={moduleStyles.knob}
                >
                  <div className={moduleStyles.rotater}>
                    <div className={moduleStyles.mark} />
                  </div>
                </div>
              </div>
            </KnobHeadless>
          </div>
        ) : undefined
      )}
    </div>
  );
};

export default Dials;
