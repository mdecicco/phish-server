import * as React from 'react';
import { ShowTrack } from '@types';
import { UseTracksResult, TrackFilters, TrackState } from './types';
import * as Actions from './actions';
import { Request, RequestResult, serverUrl, objectFields } from '@utils';
import { useAlerts } from '../alerts/hooks';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { keys } from 'ts-transformer-keys';

export function useTracks(): UseTracksResult {
    const state = useSelector((s: { tracks: TrackState }) : TrackState => s.tracks, shallowEqual);
    const dispatch = useDispatch();
    const mounted = React.useRef(false);
    const {
        tracks,
        loading,
        loadError,
        totalCount,
        filters,
        listScroll
    } = state;

    const { Error } = useAlerts();
    const loadMore = React.useCallback((replaceExisting: boolean = false) => {
        dispatch(Actions.loadTracks());
        console.log(filters);
        Request.get(serverUrl(`/api/tracks`), {
            limit: 20,
            offset: replaceExisting ? 0 : tracks.length,
            ...filters
        }).then((r: RequestResult) => {
            if (r.errored) {
                dispatch(Actions.loadTracksFailed());
                Error({
                    title: 'Oops. This was supposed to work.',
                    message: `This site is now useless. (${r.status})`,
                    duration: 0
                });
                console.log(r.result);
            } else {
                if (r.result.error) {
                    dispatch(Actions.loadTracksFailed());
                    Error({
                        title: 'Oops. That was supposed to work.',
                        message: `This site is now useless.`,
                        duration: 0
                    });
                    console.log(r.result);
                } else {
                    dispatch(Actions.receiveTracks(r.result.results as ShowTrack[], r.result.total_count, replaceExisting));
                }
            }
        });
    }, [tracks.length, filters]);

    const setFilters = React.useCallback((filters: TrackFilters) => {
        dispatch(Actions.updateTrackFilters(filters));
    }, [dispatch]);

    const setFilter = React.useCallback((name: string, value: any) => {
        dispatch(Actions.updateTrackFilters({ [name]: value }));
    }, [dispatch]);

    const setScroll = React.useCallback((value: number) => {
        dispatch(Actions.setTrackScroll(value));
    }, [dispatch]);

    React.useEffect(() => {
        if (mounted.current) loadMore(true);
        else mounted.current = true;
    }, objectFields<TrackFilters>(filters, keys<TrackFilters>()));

    return {
        loadMore,
        loading,
        loadError,
        tracks,
        totalCount,
        setFilter,
        setFilters,
        filters,
        listScroll,
        setScroll
    };
}