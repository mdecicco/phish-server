import { PlayerState, PlayerActionType, PlayerActions } from './types';
export type { PlayerState, PlayerActionType } from './types';

import * as Reducers from './reducers';
export { default as Player } from './player';
export type { PlayerType } from './player';

export {
    usePlayer as use
} from './hooks';

const defaults : PlayerState = {
    queue: [],
    playing: false,
    playOffset: 0,
    queueIndex: 0
};

export function Reduce (state: PlayerState = defaults, action: PlayerActionType) : PlayerState {
    switch (action.type) {
        case PlayerActions.Play: return Reducers.PlayReducer(state, action);
        case PlayerActions.Pause: return Reducers.PauseReducer(state, action);
        case PlayerActions.Stop: return Reducers.StopReducer(state, action);
        case PlayerActions.Next: return Reducers.NextReducer(state, action);
        case PlayerActions.Prev: return Reducers.PrevReducer(state, action);
        case PlayerActions.QueueFinished: return Reducers.QueueFinishedReducer(state, action);
        case PlayerActions.Seek: return Reducers.SeekReducer(state, action);
        case PlayerActions.PlayNext: return Reducers.PlayNextReducer(state, action);
        case PlayerActions.AddToQueue: return Reducers.AddToQueueReducer(state, action);
    }

    return state;
}