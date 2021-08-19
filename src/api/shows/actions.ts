import { Show } from '@types';
import {
    LoadShowsAction,
    ReceiveShowsAction,
    LoadShowsFailedAction,
    UpdateShowFilterAction,
    ShowActions,
    ShowFilters,
    SetShowScrollAction
} from './types';

export function loadShows() : LoadShowsAction {
    return {
        type: ShowActions.Load
    };
}

export function receiveShows(shows: Show[], totalCount: number, replaceExisting: boolean) : ReceiveShowsAction {
    return {
        type: ShowActions.Receive,
        shows,
        totalCount,
        replaceExisting
    };
}

export function loadShowsFailed() : LoadShowsFailedAction {
    return {
        type: ShowActions.LoadFailed
    };
}

export function updateShowFilters(filters: ShowFilters) : UpdateShowFilterAction {
    return {
        type: ShowActions.UpdateFilter,
        filters
    };
}

export function setShowScroll(scroll: number) : SetShowScrollAction {
    return {
        type: ShowActions.SetScroll,
        scroll
    };
}