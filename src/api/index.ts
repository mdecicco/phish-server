import * as Redux from 'redux';
import * as Alerts from './alerts';
import * as Shows from './shows';
import * as Tracks from './tracks';
import * as Player from './player';

export type {
    AlertActions,
    AlertType,
    Alert,
    AlertState,
    SubmitAlertAction,
    RemoveAlertAction,
    AlertActionType
} from './alerts';

export type {
    ShowState,
    ShowFilters
} from './shows';

export type {
    TrackState,
    TrackFilters
} from './tracks';

export type {
    PlayerState,
    PlayerType
} from './player';

export type StateType = {
    alerts: Alerts.AlertState,
    shows: Shows.ShowState,
    player: Player.PlayerState
};

export type ActionType = Alerts.AlertActionType | Shows.ShowActionType | Tracks.TrackActionType | Player.PlayerActionType;
export type StoreType = Redux.Store<StateType, ActionType>;

function createStore() : StoreType {
    const reducer = Redux.combineReducers({
        alerts: Alerts.Reduce,
        shows: Shows.Reduce,
        tracks: Tracks.Reduce,
        player: Player.Reduce
    });

    return Redux.createStore(reducer);
};

export default {
    createStore,
    Alerts,
    Shows,
    Player,
    Tracks
};