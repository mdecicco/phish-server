import { ShowTrack } from '@types';
import {
    LoadTracksAction,
    ReceiveTracksAction,
    LoadTracksFailedAction,
    UpdateTrackFilterAction,
    TrackActions,
    TrackFilters,
    SetTrackScrollAction
} from './types';

export function loadTracks() : LoadTracksAction {
    return {
        type: TrackActions.Load
    };
}

export function receiveTracks(tracks: ShowTrack[], totalCount: number, replaceExisting: boolean) : ReceiveTracksAction {
    return {
        type: TrackActions.Receive,
        tracks,
        totalCount,
        replaceExisting
    };
}

export function loadTracksFailed() : LoadTracksFailedAction {
    return {
        type: TrackActions.LoadFailed
    };
}

export function updateTrackFilters(filters: TrackFilters) : UpdateTrackFilterAction {
    return {
        type: TrackActions.UpdateFilter,
        filters
    };
}

export function setTrackScroll(scroll: number) : SetTrackScrollAction {
    return {
        type: TrackActions.SetScroll,
        scroll
    };
}