import { ShowTrack } from '@types';
import {
    PlayerActions,
    PlayAction,
    PauseAction,
    StopAction,
    NextAction,
    PrevAction,
    QueueFinishedAction,
    SeekAction,
    PlayNextAction,
    AddToQueueAction
} from './types';

export function play() : PlayAction {
    return {
        type: PlayerActions.Play
    };
}

export function pause() : PauseAction {
    return {
        type: PlayerActions.Pause
    };
}

export function stop() : StopAction {
    return {
        type: PlayerActions.Stop
    };
}

export function nextTrack() : NextAction {
    return {
        type: PlayerActions.Next
    };
}

export function prevTrack() : PrevAction {
    return {
        type: PlayerActions.Prev
    };
}

export function queueFinished() : QueueFinishedAction {
    return {
        type: PlayerActions.QueueFinished
    };
}

export function seek(position: number) : SeekAction {
    return {
        type: PlayerActions.Seek,
        position
    };
}

export function playNext(tracks: ShowTrack[]) : PlayNextAction {
    return {
        type: PlayerActions.PlayNext,
        tracks
    };
}

export function addToQueue(tracks: ShowTrack[]) : AddToQueueAction {
    return {
        type: PlayerActions.AddToQueue,
        tracks
    };
}