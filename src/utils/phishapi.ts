export function serverUrl(url: string) {
    if (location.hostname === 'localhost' || location.hostname === '192.168.1.50') return `http://192.168.1.50:6169${url}`;
    return url;
}

export function coverArtUrl (coverId: number, thumbnail: boolean) : string {
    return serverUrl(`/api/covers/${coverId}${thumbnail ? '?thumb=1' : ''}`);
}

export function trackStreamUrl (trackId: number) : string {
    return serverUrl(`/api/tracks/${trackId}/stream`);
}