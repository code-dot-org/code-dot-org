import {createContext} from 'react';

import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';

import {TimelineProps} from './TimelineUI';

export const TimelineContext = createContext<TimelineProps | null>(null);

export const useTimelineContext = () =>
  useRequiredContext(TimelineContext, 'TimelineContext');
