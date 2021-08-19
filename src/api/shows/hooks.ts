import * as React from 'react';
import { Show } from '@types';
import { UseShowsResult, ShowFilters, ShowState } from './types';
import * as Actions from './actions';
import { Request, RequestResult, serverUrl, objectFields } from '@utils';
import { useAlerts } from '../alerts/hooks';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { keys } from 'ts-transformer-keys';

export function useShows(): UseShowsResult {
    const state = useSelector((s: { shows: ShowState }) : ShowState => s.shows, shallowEqual);
    const dispatch = useDispatch();
    const mounted = React.useRef(false);
    const {
        shows,
        loading,
        loadError,
        totalCount,
        filters,
        listScroll
    } = state;

    const { Error } = useAlerts();
    const loadMore = React.useCallback((replaceExisting: boolean = false) => {
        dispatch(Actions.loadShows());
        console.log(filters);
        Request.get(serverUrl(`/api/shows`), {
            limit: 20,
            offset: replaceExisting ? 0 : shows.length,
            ...filters
        }).then((r: RequestResult) => {
            if (r.errored) {
                dispatch(Actions.loadShowsFailed());
                Error({
                    title: 'Oops. This was supposed to work.',
                    message: `This site is now useless. (${r.status})`,
                    duration: 0
                });
                console.log(r.result);
            } else {
                if (r.result.error) {
                    dispatch(Actions.loadShowsFailed());
                    Error({
                        title: 'Oops. That was supposed to work.',
                        message: `This site is now useless.`,
                        duration: 0
                    });
                    console.log(r.result);
                } else {
                    dispatch(Actions.receiveShows(r.result.results as Show[], r.result.total_count, replaceExisting));
                }
            }
        });
    }, [shows.length, filters]);

    const setFilters = React.useCallback((filters: ShowFilters) => {
        dispatch(Actions.updateShowFilters(filters));
    }, [dispatch]);

    const setFilter = React.useCallback((name: string, value: any) => {
        dispatch(Actions.updateShowFilters({ [name]: value }));
    }, [dispatch]);

    const setScroll = React.useCallback((value: number) => {
        dispatch(Actions.setShowScroll(value));
    }, [dispatch]);

    React.useEffect(() => {
        if (mounted.current) loadMore(true);
        else mounted.current = true;
    }, objectFields<ShowFilters>(filters, keys<ShowFilters>()));

    return {
        loadMore,
        loading,
        loadError,
        shows,
        totalCount,
        setFilter,
        setFilters,
        filters,
        listScroll,
        setScroll
    };
}