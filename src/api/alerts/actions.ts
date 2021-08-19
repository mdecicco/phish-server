import {
    Alert,
    AlertActions,
    AlertType,
    SubmitAlertParams,
    SubmitAlertAction,
    RemoveAlertAction,
    UpdateAlertAction
} from "./types";
import { UUID } from '@utils';
import * as Constants from '@constants';

export function submitAlert(params: SubmitAlertParams) : SubmitAlertAction {
    return {
        type: AlertActions.Submit,
        alert: {
            uuid: '', // UUID must be assigned when the action is processed
            type: params.type || AlertType.Info,
            duration: params.duration !== undefined ? params.duration : Constants.DefaultAlertDuration,
            timeoutId: null,
            title: params.title,
            message: params.message || '',
            imgUrl: params.imgUrl || null,
            onClickAction: params.onClickAction ? JSON.parse(JSON.stringify(params.onClickAction)) : null,
            buttons: params.buttons ? JSON.parse(JSON.stringify(params.buttons)) : [],
            fading: false,
            hovered: false
        }
    };
}

export function updateAlert(alert: Alert) : UpdateAlertAction {
    return {
        type: AlertActions.Update,
        alert: JSON.parse(JSON.stringify(alert))
    };
}

export function removeAlert(id: UUID) : RemoveAlertAction {
    return {
        type: AlertActions.Remove,
        uuid: id
    };
}
