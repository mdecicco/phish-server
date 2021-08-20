import { ShowTrack } from '@types';
import { StoreType } from '../';
import { coverArtUrl, showDate, showLocation, trackStreamUrl } from '@utils';
import * as Actions from './actions';

class Player {
    store: StoreType;
    streams: HTMLAudioElement[];
    userPlayed: boolean;
    userPaused: boolean;
    lastNextTrackId: number;
    lastPlayPosition: number;
    pollInterval: NodeJS.Timeout;
    playing: boolean;

    constructor(store: StoreType) {
        this.store = store;
        this.streams = [];
        this.userPlayed = false;
        this.userPaused = false;
        this.lastNextTrackId = 0;
        this.lastPlayPosition = 0;
        this.pollInterval = setInterval(this.poll.bind(this), 1000);
        this.playing = false;
        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (this.state().queue.length === 0) return;
                this.store.dispatch(Actions.play());
                this.play();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (this.state().queue.length === 0) return;
                this.store.dispatch(Actions.pause());
                this.pause();
            });
            /*
            navigator.mediaSession.setActionHandler('seekbackward', function() {
                console.log('-seekbackward');
                console.log(arguments);
            });
            navigator.mediaSession.setActionHandler('seekforward', function() {
                console.log('-seekforward');
                console.log(arguments);
            });
            */
        }
    }

    bindNext() {
        if (!navigator.mediaSession) return;
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const { queue, queueIndex } = this.state();
            if (queue.length <= queueIndex + 1) return;
            this.store.dispatch(Actions.nextTrack());
            this.next();
        });
    }

    bindPrev() {
        if (!navigator.mediaSession) return;
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            const { queueIndex } = this.state();
            if (queueIndex === 0) return;
            this.store.dispatch(Actions.prevTrack());
            this.prev();
        });
    }

    unbindNext() {
        if (!navigator.mediaSession) return;
        navigator.mediaSession.setActionHandler('nexttrack', null);
    }

    unbindPrev() {
        if (!navigator.mediaSession) return;
        navigator.mediaSession.setActionHandler('previoustrack', null);
    }

    updateForeignControls() {
        const { queue, queueIndex } = this.state();
        if (queue.length <= queueIndex + 1) this.unbindNext();
        else this.bindNext();

        if (queueIndex === 0) this.unbindPrev();
        else this.bindPrev();
    }

    state() {
        return this.store.getState().player;
    }

    poll() {
        this.updateForeignControls();

        if (this.streams.length === 0) return;
        const { queue, queueIndex } = this.state();

        if (queue.length > queueIndex + 1 && queue[queueIndex + 1].id !== this.lastNextTrackId) {
            this.lastNextTrackId = queue[queueIndex + 1].id;
            this.nextTrackChanged(this.lastNextTrackId);
        }

        const stream = this.streams.length > 0 ? this.streams[0] : null;
        if (stream && !stream.paused && stream.currentTime != this.lastPlayPosition) {
            this.lastPlayPosition = stream.currentTime;
            this.store.dispatch(Actions.seek(this.lastPlayPosition));
        }
    }

    nextTrackChanged(nextTrackId: number) {
        if (this.streams.length <= 1) {
            this.streams.push(this.createStream(nextTrackId));
        } else {
            if (this.streams[1].src !== trackStreamUrl(nextTrackId)) {
                this.streams.splice(1, 1, this.createStream(nextTrackId));
            }
        }
    }

    userPlay(streamIdx: number) {
        if (streamIdx >= this.streams.length) return;
        this.userPlayed = true;
        this.streams[streamIdx].play();
    }

    userPause(streamIdx: number) {
        if (streamIdx >= this.streams.length) return;
        this.userPaused = true;
        this.streams[streamIdx].pause();
    }

    trackFinished() {
        console.log('finished playing');
        const { queue, queueIndex } = this.state();
        this.updateForeignControls();

        this.streams.shift();
        if (queue.length > queueIndex + 1) {
            this.store.dispatch(Actions.nextTrack());
            this.play();
            this.lastPlayPosition = 0;
        } else {
            this.store.dispatch(Actions.queueFinished());
            this.playing = false;
            this.lastPlayPosition = 0;
        }
    }

    trackPaused() {
        this.playing = false;
        this.lastPlayPosition = 0;
        if (this.streams.length > 0) {
            this.lastPlayPosition = this.streams[0].currentTime;
            if (this.streams[0].ended) return;
        }
        
        if (this.userPaused) {
            console.log('paused by user');
            this.userPaused = false;
            return;
        }

        console.log('paused externally');
        this.store.dispatch(Actions.pause());
    }

    trackPlayed() {
        this.playing = true;
        if (this.userPlayed) {
            console.log('played by user');
            this.userPlayed = false;
            return;
        }
        console.log('played externally');

        this.store.dispatch(Actions.play());
    }

    createStream(trackId: number) {
        console.log('Loading track', trackId);
        const stream = new Audio(trackStreamUrl(trackId));
        stream.onended = this.trackFinished.bind(this);
        stream.onplay = this.trackPlayed.bind(this);
        stream.onpause = this.trackPaused.bind(this);
        return stream;
    }

    // Redux state should be updated before any of the following methods are called

    play() {
        const { queue, queueIndex } = this.state();
        if (queue.length <= queueIndex) return;

        if (this.streams.length > 0) {
            if (this.streams[0].paused) {
                this.userPlay(0);
                this.poll();
                if (navigator.mediaSession) {
                    const track = queue[queueIndex];
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: track.title,
                        artist: track.artists.map(a => a.name).join(', '),
                        album: `${showDate(track)} - ${showLocation(track)}`,
                        artwork: [
                            { src: coverArtUrl(track.cover_art_id) }
                        ]
                    });
                }
            }
        } else {
            this.streams.push(this.createStream(queue[queueIndex].id));
            this.userPlay(0);
            this.poll();
            if (navigator.mediaSession) {
                const track = queue[queueIndex];
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.title,
                    artist: track.artists.map(a => a.name).join(', '),
                    album: `${showDate(track)} - ${showLocation(track)}`,
                    artwork: [
                        { src: coverArtUrl(track.cover_art_id) }
                    ]
                });
            }
        }
    }

    pause() {
        if (this.streams.length === 0) return;
        this.userPause(0);
    }

    stop() {
        if (this.streams.length > 0) {
            if (!this.streams[0].paused) this.userPause(0);
            this.streams = [];
        }
        this.lastPlayPosition = 0;
        this.lastNextTrackId = 0;
        this.playing = false;
        this.unbindNext();
        this.unbindPrev();
    }

    next() {
        const { queue, queueIndex } = this.state();
        console.log('next');
        if (queue.length === 0) return;

        if (this.streams.length > 0) {
            this.userPause(0);
            this.streams[0].currentTime = 0;
            this.streams.shift();
        }

        this.lastPlayPosition = 0;
        if (this.playing) this.play();
        this.updateForeignControls();
    }

    prev() {
        const { queue, queueIndex } = this.state();
        console.log('prev');
        if (queue.length === 0) return;
        if (this.streams.length > 0) {
            this.userPause(0);
            this.streams[0].currentTime = 0;
        }
        this.streams.unshift(this.createStream(queue[queueIndex].id));

        this.lastPlayPosition = 0;
        if (this.playing) this.play();
        this.updateForeignControls();
    }

    seek(position: number) {
        if (this.streams.length === 0) return;
        this.streams[0].currentTime = position;
        this.lastPlayPosition = position;
    }
};

export default Player;
export type { Player as PlayerType };