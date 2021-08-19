import { Show, ShowTrack } from '@types';
import { serverUrl } from './phishapi';

export function showDate (s: Show | ShowTrack) : string {
    let d = '??/??/??';
    if (s.date) {
        const dcomps = s.date.split('/');
        if (dcomps.length === 3) {
            if (dcomps[0].length === 1) dcomps[0] = `0${dcomps[0]}`;
            if (dcomps[1].length === 1) dcomps[1] = `0${dcomps[1]}`;
            d = `${dcomps[0]}/${dcomps[1]}/${dcomps[2]}`;
        }
    }

    return d;
}

export function showLocation (s: Show | ShowTrack) : string {
    let location = '';
    if (s.city && s.city !== '---') location = s.city;
    if (s.state && s.state !== '---') {
        if (location.length > 0) location += ', ';
        location += s.state;
    }

    return location;
}