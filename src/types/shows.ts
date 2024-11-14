export type ShowDownload = {
    id: number,
    show_id: number,
    link_id: number,
    is_downloaded: boolean,
    is_extracted: boolean,
    download_error: string | null,
    extract_error: string | null,
    finished_on: string,
    started_on: string,
    attempts: number
};

export type ShowLink = {
    id: number,
    show_id: number,
    is_folder: boolean,
    is_valid: boolean,
    url: string,
    download: ShowDownload
};

export type ShowGenre = {
    id: number,
    name: string
};

export type ShowArtist = {
    id: number,
    name: string
};

export type ShowTrack = {
    id: number,
    show_id: number,
    link_id: number,
    cover_art_id: number,
    track_index: number,
    artists: ShowArtist[],
    genres: ShowGenre[],
    bit_rate: number,
    sample_rate: number,
    channels: number,
    codec: string,
    codec_profile: string,
    duration: number,
    lossless: boolean,
    is_sbd: boolean,
    note: string | null,
    title: string,
    city: string,
    date: string,
    added_on: string,
    state: string | null,
    timestamp: number,
    venue: string,
    show_metadata: string,
};

export type Show = {
    added_on: string,
    artist_ids: string,
    artists: string,
    city: string,
    cover_art_id: number,
    date: string,
    duration: number,
    genre_ids: string,
    genres: string,
    id: number,
    is_sbd: boolean,
    link_id: number,
    link_url: string,
    metadata: string,
    notes: string | null,
    pdn_id: number | null,
    source: string | null,
    state: string | null,
    timestamp: number,
    track_count: number,
    track_durations: string,
    track_ids: string,
    track_titles: string,
    venue: string,
    links?: ShowLink[],
    tracks?: { [s: number]: ShowTrack[] }
};

export type DetailedShow = {
    added_on: string,
    artist_ids: string,
    artists: string,
    city: string,
    cover_art_id: number,
    date: string,
    duration: number,
    genre_ids: string,
    genres: string,
    id: number,
    is_sbd: boolean,
    link_id: number,
    link_url: string,
    metadata: string,
    notes: string | null,
    pdn_id: number | null,
    source: string | null,
    state: string | null,
    timestamp: number,
    track_count: number,
    track_durations: string,
    track_ids: string,
    track_titles: string,
    venue: string,
    links: ShowLink[],
    tracks: { [s: number]: ShowTrack[] }
};