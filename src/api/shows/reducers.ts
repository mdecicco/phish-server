import {
    ShowState,
    LoadShowsAction,
    ReceiveShowsAction,
    LoadShowsFailedAction,
    UpdateShowFilterAction,
    SetShowScrollAction,
    ShowFilters
} from './types';
import update from 'immutability-helper';

export function LoadShowsReducer(state: ShowState, action: LoadShowsAction): ShowState {
    return update(state, {
        loadError: { $set: false },
        loading: { $set: true }
    });
}

export function ReceiveReducer(state: ShowState, action: ReceiveShowsAction): ShowState {
    if (action.replaceExisting) {
        return update(state, {
            loading: { $set: false },
            totalCount: { $set: action.totalCount },
            shows: {
                $set: action.shows
            }
        });
    } else {
        return update(state, {
            loading: { $set: false },
            totalCount: { $set: action.totalCount },
            shows: {
                $push: action.shows
            }
        });
    }
}

export function LoadShowsFailedReducer(state: ShowState, action: LoadShowsFailedAction): ShowState {
    return update(state, {
        loading: { $set: false },
        loadError: { $set: true }
    });
}

export function UpdateShowFilterReducer(state: ShowState, action: UpdateShowFilterAction): ShowState {
    const newState = update(state, {
        filters: { $merge: action.filters }
    });

    const params = [];
    for (const prop in newState.filters) {
        const val = newState.filters[prop as keyof ShowFilters];
        let param = '';
        if (val) {
           if ((typeof val) === 'string') param = val as string;
           else if (val instanceof Date) param = (val as Date).toISOString();
           else param = val.toString();
        }
        params.push(`${prop}=${encodeURIComponent(param)}`);
    }

    history.replaceState(null, document.title, `?${params.join('&')}`);

    return newState;
}

export function SetShowScrollReducer(state: ShowState, action: SetShowScrollAction): ShowState {
    return update(state, {
        listScroll: { $set: action.scroll }
    });
}