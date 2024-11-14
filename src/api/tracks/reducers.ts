import {
    TrackState,
    LoadTracksAction,
    ReceiveTracksAction,
    LoadTracksFailedAction,
    UpdateTrackFilterAction,
    SetTrackScrollAction,
    TrackFilters
} from './types';
import update from 'immutability-helper';

export function LoadTracksReducer(state: TrackState, action: LoadTracksAction): TrackState {
    return update(state, {
        loadError: { $set: false },
        loading: { $set: true }
    });
}

export function ReceiveReducer(state: TrackState, action: ReceiveTracksAction): TrackState {
    if (action.replaceExisting) {
        return update(state, {
            loading: { $set: false },
            totalCount: { $set: action.totalCount },
            tracks: {
                $set: action.tracks
            }
        });
    } else {
        return update(state, {
            loading: { $set: false },
            totalCount: { $set: action.totalCount },
            tracks: {
                $push: action.tracks
            }
        });
    }
}

export function LoadTracksFailedReducer(state: TrackState, action: LoadTracksFailedAction): TrackState {
    return update(state, {
        loading: { $set: false },
        loadError: { $set: true }
    });
}

export function UpdateTrackFilterReducer(state: TrackState, action: UpdateTrackFilterAction): TrackState {
    const newState = update(state, {
        filters: { $merge: action.filters }
    });

    const params = [];
    for (const prop in newState.filters) {
        const val = newState.filters[prop as keyof TrackFilters];
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

export function SetTrackScrollReducer(state: TrackState, action: SetTrackScrollAction): TrackState {
    return update(state, {
        listScroll: { $set: action.scroll }
    });
}