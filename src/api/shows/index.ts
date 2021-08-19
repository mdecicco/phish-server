import { ShowState, ShowActionType, ShowActions } from './types';
export type { ShowState, ShowActionType, ShowFilters } from './types';

import * as Reducers from './reducers';

export {
    useShows as use
} from './hooks';

const defaults : ShowState = {
    shows: [],
    loading: false,
    loadError: false,
    totalCount: 1,
    filters: {},
    listScroll: 0
};

export function Reduce (state: ShowState = defaults, action: ShowActionType) : ShowState {
    switch (action.type) {
        case ShowActions.Load: return Reducers.LoadShowsReducer(state, action);
        case ShowActions.Receive: return Reducers.ReceiveReducer(state, action);
        case ShowActions.LoadFailed: return Reducers.LoadShowsFailedReducer(state, action);
        case ShowActions.UpdateFilter: return Reducers.UpdateShowFilterReducer(state, action);
        case ShowActions.SetScroll: return Reducers.SetShowScrollReducer(state, action);
    }

    return state;
}