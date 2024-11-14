import { TrackState, TrackActionType, TrackActions } from './types';
export type { TrackState, TrackActionType, TrackFilters } from './types';

import * as Reducers from './reducers';

export {
    useTracks as use
} from './hooks';

const defaults : TrackState = {
    tracks: [],
    loading: false,
    loadError: false,
    totalCount: 1,
    filters: {
        order: 'timestamp_desc'
    },
    listScroll: 0
};

export function Reduce (state: TrackState = defaults, action: TrackActionType) : TrackState {
    switch (action.type) {
        case TrackActions.Load: return Reducers.LoadTracksReducer(state, action);
        case TrackActions.Receive: return Reducers.ReceiveReducer(state, action);
        case TrackActions.LoadFailed: return Reducers.LoadTracksFailedReducer(state, action);
        case TrackActions.UpdateFilter: return Reducers.UpdateTrackFilterReducer(state, action);
        case TrackActions.SetScroll: return Reducers.SetTrackScrollReducer(state, action);
    }

    return state;
}