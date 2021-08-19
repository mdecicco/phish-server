import { Show } from '@types';

export type ShowFilters = {
    timestamp_lt?: number | Date,
    timestamp_lte?: number | Date,
    timestamp_gt?: number | Date,
    timestamp_gte?: number | Date,
    timestamp_not?: number | Date,
    timestamp_null?: boolean,
    timestamp?: number | Date,
    date?: string,
    date_like?: string,
    date_null?: boolean
    venue?: string,
    venue_like?: string,
    venue_null?: boolean,
    city?: string,
    city_like?: string,
    city_null?: boolean,
    state?: string,
    state_like?: string,
    state_null?: boolean,
    source?: string,
    source_like?: string,
    source_null?: boolean,
    notes?: string,
    notes_like?: string,
    notes_null?: boolean,
    is_sbd?: boolean,
    is_sbd_null?: boolean,
    added_on_lt?: number | Date,
    added_on_lte?: number | Date,
    added_on_gt?: number | Date,
    added_on_gte?: number | Date,
    added_on_not?: number | Date,
    added_on_null?: boolean,
    added_on?: number | Date,
    duration_lt?: number,
    duration_lte?: number,
    duration_gt?: number,
    duration_gte?: number,
    duration_not?: number,
    duration_null?: boolean,
    duration?: number,
    track_count_lt?: number,
    track_count_lte?: number,
    track_count_gt?: number,
    track_count_gte?: number,
    track_count_not?: number,
    track_count_null?: boolean,
    track_count?: number,
    track_titles?: string,
    track_titles_like?: string,
    track_titles_null?: boolean,
    genres?: string,
    genres_like?: string,
    genres_null?: boolean,
    artists?: string,
    artists_like?: string,
    artists_null?: boolean,
    order?: string,
    search?: string
};

type BoolKeys = 'timestamp_null' | 'date_null' | 'venue_null' | 'city_null' | 'state_null' | 'source_null' |
                'notes_null' | 'is_sbd' | 'is_sbd_null' | 'added_on_null' | 'duration_null' | 'track_count_null' |
                'track_titles_null' | 'genres_null' | 'artists_null';
type DateKeys = 'timestamp_lt' | 'timestamp_lte' | 'timestamp_gt' | 'timestamp_gte' | 'timestamp_not' |
                'timestamp' | 'added_on_lt' | 'added_on_lte' | 'added_on_gt' | 'added_on_gte' | 'added_on_not' |
                'added_on';
type StringKeys = 'date' | 'venue' | 'city' | 'state' | 'source' | 'notes' | 'track_titles' | 'track_titles_like' |
                  'genres' | 'genres_like' | 'artists' | 'artists_like' | 'order' | 'search';
type NumberKeys = 'duration_lt' | 'duration_lte' | 'duration_gt' | 'duration_gte' | 'duration_not' | 'duration' |
                  'track_count_lt' | 'track_count_lte' | 'track_count_gt' | 'track_count_gte' | 'track_count_not' |
                  'track_count';

export interface UseShowsResult {
    loadMore(): void;
    setFilter(name: BoolKeys, value: boolean): void;
    setFilter(name: DateKeys, value: number | Date): void;
    setFilter(name: StringKeys, value: string): void;
    setFilter(name: NumberKeys, value: number): void;
    setFilters(filters: ShowFilters): void;
    setScroll(value: number): void;

    shows: Show[];
    loading: boolean;
    loadError: boolean;
    totalCount: number;
    filters: ShowFilters;
    listScroll: number;
};

export type ShowState = {
    shows: Show[],
    loading: boolean,
    loadError: boolean,
    totalCount: number,
    filters: ShowFilters,
    listScroll: number
};

export enum ShowActions {
    Load = 'shows/SET_LOADING',
    Receive = 'shows/RECEIVE',
    LoadFailed = 'shows/LOAD_FAILED',
    UpdateFilter = 'shows/UPDATE_FILTER',
    SetScroll = 'shows/SET_SCROLL'
};

export type LoadShowsAction = {
    type: ShowActions.Load
};

export type ReceiveShowsAction = {
    type: ShowActions.Receive,
    shows: Show[],
    totalCount: number,
    replaceExisting: boolean
};

export type LoadShowsFailedAction = {
    type: ShowActions.LoadFailed
};

export type UpdateShowFilterAction = {
    type: ShowActions.UpdateFilter,
    filters: ShowFilters
};

export type SetShowScrollAction = {
    type: ShowActions.SetScroll,
    scroll: number
};

export type ShowActionType = LoadShowsAction | ReceiveShowsAction | LoadShowsFailedAction | UpdateShowFilterAction | SetShowScrollAction;