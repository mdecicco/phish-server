import { ShowTrack } from "@types";

export type PlayerState = {
    queue: ShowTrack[],
    playing: boolean,
    playOffset: number,
    queueIndex: number
};

export enum PlayerActions {
    Play = 'player/PLAY',
    Pause = 'player/PAUSE',
    Stop = 'player/STOP',
    Next = 'player/NEXT',
    Prev = 'player/PREV',
    QueueFinished = 'player/QUEUE_FINISHED',
    Seek = 'player/SEEK',
    PlayNext = 'player/PLAY_NEXT',
    AddToQueue = 'player/ADD_TO_QUEUE'
};

export type PlayAction = {
    type: PlayerActions.Play
};

export type PauseAction = {
    type: PlayerActions.Pause
};

export type StopAction = {
    type: PlayerActions.Stop
};

export type NextAction = {
    type: PlayerActions.Next
};

export type PrevAction = {
    type: PlayerActions.Prev
};

export type QueueFinishedAction = {
    type: PlayerActions.QueueFinished
};

export type SeekAction = {
    type: PlayerActions.Seek,
    position: number
};

export type PlayNextAction = {
    type: PlayerActions.PlayNext,
    tracks: ShowTrack[]
};

export type AddToQueueAction = {
    type: PlayerActions.AddToQueue,
    tracks: ShowTrack[]
};


export type PlayerActionType = PlayAction | PauseAction | StopAction | NextAction | PrevAction | QueueFinishedAction | SeekAction | PlayNextAction | AddToQueueAction;