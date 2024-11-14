import * as React from 'react';
import * as Actions from './actions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { PlayerState } from './types';
import { DetailedShow, Show, ShowTrack } from '@types';
import { useAlerts } from '../alerts/hooks';
import { Request, RequestResult, serverUrl } from '@utils';

type AlertFunc = (options: { title: string, message: string, duration: number }) => void;
const getShow = (id: number, Alert: AlertFunc, Error: AlertFunc) : Promise<ShowTrack[]> => {
    return new Promise(resolve => {
        Request.get(serverUrl(`/api/shows/${id}`)).then((r: RequestResult) => {
            if (r.errored || r.result.error) {
                Error({
                    title: 'Whoops',
                    message: 'Failed to get track info for show.',
                    duration: 5
                });
                resolve([]);
            } else {
                const show = r.result.show as DetailedShow;
                if (show.links.length === 1) {
                    resolve(show.tracks[show.links[0].id]);
                }
                else if (show.links.length > 1) {
                    Alert({
                        title: 'Cannot play show',
                        message: 'Show had multiple download links. Open the show details to select a link to play.',
                        duration: 5
                    });
                    resolve([]);
                } else {
                    Error({
                        title: 'Cannot play show',
                        message: 'Show has no links from which tracks would be downloaded.',
                        duration: 5
                    });
                    resolve([]);
                }
            }
        });
    });
};

export function usePlayer() {
    const {
        queue,
        queueIndex,
        playing,
        playOffset
    } = useSelector((s: { player: PlayerState }) : PlayerState => s.player, shallowEqual);
    const dispatch = useDispatch();
    const { Alert, Error } = useAlerts();

    const play = React.useCallback(() => {
        dispatch(Actions.play());
        window.player.play();
    }, []);
    const pause = React.useCallback(() => {
        dispatch(Actions.pause());
        window.player.pause();
    }, []);
    const stop = React.useCallback(() => {
        dispatch(Actions.stop());
        window.player.stop();
    }, []);
    const next = React.useCallback(() => {
        dispatch(Actions.nextTrack());
        window.player.next();
    }, []);
    const previous = React.useCallback(() => {
        dispatch(Actions.prevTrack());
        window.player.prev();
    }, []);
    const playNow = React.useCallback((param: ShowTrack[] | Show) => {
        if (param instanceof Array) {
            console.log('play now', param);
            dispatch(Actions.stop());
            window.player.stop();
            dispatch(Actions.addToQueue(param));
            dispatch(Actions.play());
            window.player.play();
        }
        else {
            getShow(param.id, Alert, Error).then(tracks => {
                if (tracks.length > 0) {
                    dispatch(Actions.stop());
                    window.player.stop();
                    dispatch(Actions.addToQueue(tracks));
                    dispatch(Actions.play());
                    window.player.play();
                }
            });
        }
    }, []);
    const playNext = React.useCallback((param: ShowTrack[] | Show) => {
        if (param instanceof Array) {
            dispatch(Actions.playNext(param));
            if (queue.length === 0) {
                dispatch(Actions.play());
                window.player.play();
            }
        }
        else {
            getShow(param.id, Alert, Error).then(tracks => {
                if (tracks.length > 0) {
                    dispatch(Actions.playNext(tracks));
                    if (queue.length === 0) {
                        dispatch(Actions.play());
                        window.player.play();
                    }
                }
            });
        }
    }, []);
    const addToQueue = React.useCallback((param: ShowTrack[] | Show) => {
        if (param instanceof Array) {
            dispatch(Actions.addToQueue(param));
            if (queue.length === 0) {
                dispatch(Actions.play());
                window.player.play();
            }
        }
        else {
            getShow(param.id, Alert, Error).then(tracks => {
                if (tracks.length > 0) {
                    dispatch(Actions.addToQueue(tracks));
                    if (queue.length === 0) {
                        dispatch(Actions.play());
                        window.player.play();
                    }
                }
            });
        }
    }, []);
    const playPrompt = React.useCallback((param: ShowTrack[] | Show) => {
        const add = (tracks: ShowTrack[]) => {
            if (queue.length === 0) {
                dispatch(Actions.addToQueue(tracks));
                dispatch(Actions.play());
                window.player.play();
            } else {
                Alert({
                    title: 'But How?',
                    message: 'There are currently tracks in the queue.',
                    expand: true,
                    buttons: [
                        { label: 'Play Next', actions: [Actions.playNext(tracks)], closeOnClick: true },
                        { label: 'Add to Queue', actions: [Actions.addToQueue(tracks)], closeOnClick: true },
                        { label: 'Cancel' }
                    ]
                });
            }
        };
        if (param instanceof Array) add(param);
        else {
            getShow(param.id, Alert, Error).then(tracks => {
                if (tracks.length > 0) add(tracks);
            });
        }
    }, [queue.length]);
    const seek = React.useCallback((position: number) => {
        if (queue.length === 0) return;
        dispatch(Actions.seek(position));
        window.player.seek(position);
    }, [queue.length]);

    const currentTrack = queueIndex < queue.length ? queue[queueIndex] : null;

    return {
        play,
        pause,
        stop,
        next,
        previous,
        playNow,
        playNext,
        addToQueue,
        playPrompt,
        seek,
        queue,
        queueIndex,
        playing,
        playOffset,
        currentTrack
    };
}