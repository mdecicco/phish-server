
import {
    PlayerState,
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

import update from 'immutability-helper';

export function PlayReducer(state: PlayerState, action: PlayAction): PlayerState {
    return update(state, {
        playing: { $set: state.queueIndex < state.queue.length }
    });
}

export function PauseReducer(state: PlayerState, action: PauseAction): PlayerState {
    return update(state, {
        playing: { $set: false }
    });
}

export function StopReducer(state: PlayerState, action: StopAction): PlayerState {
    return update(state, {
        playing: { $set: false },
        queue: { $set: [] },
        queueIndex: { $set: 0 },
        playOffset: { $set: 0 }
    });
}

export function NextReducer(state: PlayerState, action: NextAction): PlayerState {
    return update(state, {
        queueIndex: { $set: Math.min(state.queueIndex + 1, state.queue.length - 1) },
        playOffset: { $set: 0 }
    });
}

export function PrevReducer(state: PlayerState, action: PrevAction): PlayerState {
    return update(state, {
        queueIndex: { $set: Math.max(state.queueIndex - 1, 0) },
        playOffset: { $set: 0 }
    });
}

export function QueueFinishedReducer(state: PlayerState, action: QueueFinishedAction): PlayerState {
    return update(state, {
        queueIndex: { $set: 0 },
        playOffset: { $set: 0 },
        playing: { $set: false }
    });
}

export function SeekReducer(state: PlayerState, action: SeekAction): PlayerState {
    let sanitizedPos = 0;
    if (state.queueIndex < state.queue.length) {
        sanitizedPos = Math.max(Math.min(action.position, state.queue[state.queueIndex].duration), 0);
    }
    return update(state, {
        playOffset: { $set: sanitizedPos }
    });
}

export function PlayNextReducer(state: PlayerState, action: PlayNextAction): PlayerState {
    if ((state.queueIndex + 1) >= state.queue.length) {
        return update(state, {
            queue: { $push: action.tracks }
        });
    }

    return update(state, {
        queue: { $splice: [[state.queueIndex + 1, 0, ...action.tracks]] }
    });
}

export function AddToQueueReducer(state: PlayerState, action: AddToQueueAction): PlayerState {
    return update(state, {
        queue: { $push: action.tracks }
    });
}