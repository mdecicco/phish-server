import { ShowTrack } from '@types';

export type TrackFilters = {
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
    title?: string,
    title_like?: string,
    title_null?: boolean
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
    note?: string,
    note_like?: string,
    note_null?: boolean,
    is_sbd?: boolean,
    is_sbd_null?: boolean,
    lossless?: boolean,
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
    sample_rate_lt?: number,
    sample_rate_lte?: number,
    sample_rate_gt?: number,
    sample_rate_gte?: number,
    sample_rate_not?: number,
    sample_rate_null?: boolean,
    sample_rate?: number,
    bit_rate_lt?: number,
    bit_rate_lte?: number,
    bit_rate_gt?: number,
    bit_rate_gte?: number,
    bit_rate_not?: number,
    bit_rate_null?: boolean,
    bit_rate?: number,
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
                'note_null' | 'is_sbd' | 'is_sbd_null' | 'added_on_null' | 'duration_null' | 'track_count_null' |
                'title_null' | 'genres_null' | 'artists_null' | 'sample_rate_null' | 'bit_rate_null' | 'lossless';
type DateKeys = 'timestamp_lt' | 'timestamp_lte' | 'timestamp_gt' | 'timestamp_gte' | 'timestamp_not' |
                'timestamp' | 'added_on_lt' | 'added_on_lte' | 'added_on_gt' | 'added_on_gte' | 'added_on_not' |
                'added_on';
type StringKeys = 'date' | 'venue' | 'city' | 'state' | 'source' | 'notes' | 'title' | 'title_like' | 'genres' |
                  'genres_like' | 'artists' | 'artists_like' | 'order' | 'search';
type NumberKeys = 'duration_lt' | 'duration_lte' | 'duration_gt' | 'duration_gte' | 'duration_not' | 'duration' |
                  'sample_rate_lt' | 'sample_rate_lte' | 'sample_rate_gt' | 'sample_rate_gte' | 'sample_rate_not' |
                  'sample_rate' | 'bit_rate_lt' | 'bit_rate_lte' | 'bit_rate_gt' | 'bit_rate_gte' | 'bit_rate_not' |
                  'bit_rate';

export interface UseTracksResult {
    loadMore(): void;
    setFilter(name: BoolKeys, value: boolean): void;
    setFilter(name: DateKeys, value: number | Date): void;
    setFilter(name: StringKeys, value: string): void;
    setFilter(name: NumberKeys, value: number): void;
    setFilters(filters: TrackFilters): void;
    setScroll(value: number): void;

    tracks: ShowTrack[];
    loading: boolean;
    loadError: boolean;
    totalCount: number;
    filters: TrackFilters;
    listScroll: number;
};

export type TrackState = {
    tracks: ShowTrack[],
    loading: boolean,
    loadError: boolean,
    totalCount: number,
    filters: TrackFilters,
    listScroll: number
};

export enum TrackActions {
    Load = 'tracks/SET_LOADING',
    Receive = 'tracks/RECEIVE',
    LoadFailed = 'tracks/LOAD_FAILED',
    UpdateFilter = 'tracks/UPDATE_FILTER',
    SetScroll = 'tracks/SET_SCROLL'
};

export type LoadTracksAction = {
    type: TrackActions.Load
};

export type ReceiveTracksAction = {
    type: TrackActions.Receive,
    tracks: ShowTrack[],
    totalCount: number,
    replaceExisting: boolean
};

export type LoadTracksFailedAction = {
    type: TrackActions.LoadFailed
};

export type UpdateTrackFilterAction = {
    type: TrackActions.UpdateFilter,
    filters: TrackFilters
};

export type SetTrackScrollAction = {
    type: TrackActions.SetScroll,
    scroll: number
};

export type TrackActionType = LoadTracksAction | ReceiveTracksAction | LoadTracksFailedAction | UpdateTrackFilterAction | SetTrackScrollAction;