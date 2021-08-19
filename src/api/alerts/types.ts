import { UUID } from '@utils';
import { ButtonProps } from '@components';
import { Action } from 'redux';

export enum AlertActions {
    Submit = 'alerts/SUBMIT_ALERT',
    Update = 'alerts/UPDATE_ALERT',
    Remove = 'alerts/REMOVE_ALERT'
};

export enum AlertType {
    Info = 0,
    Warning = 1,
    Error = 2
};

/**
 * - label
 *    - Text displayed on the button.
 * - action
 *    - Action to dispatch when a user clicks on the button. Can be any redux action.
 *      If left unset, the button will dismiss the alert.
 * - buttonProps
 *    - Properties which will be passed to the <Button> component
 * - closeOnClick
 *    - If true, the alert will be dismissed after the action is fired
 */
export type AlertButton = {
    label: string,
    action?: Action,
    buttonProps?: ButtonProps,
    closeOnClick?: boolean
};


/**
 * - type
 *    - Type of alert box (one of API.Alerts.AlertType.[Info | Warning | Error])
 * - title
 *    - Alert box title
 * - message
 *    - (optional) Alert box message
 * - duration
 *    - (optional) Number of seconds the alert will be displayed for.
 *      0 = no automatic dismissal. Defaults to Constants.DefaultAlertDuration.
 * - imgUrl
 *    - (optional) URL of an image to display as a substitute for the info/warning/error icons
 * - onClickAction
 *    - (optional) Action to dispatch when a user clicks on the alert box itself (and not on
 *      any buttons). Can be any redux action.
 * - buttons
 *    - (optional) Array of objects which define any buttons which should be present on the alert.
 */
export type SubmitAlertParams = {
    title: string,
    message?: string,
    type?: AlertType,
    duration?: number,
    imgUrl?: string,
    onClickAction?: Action,
    buttons?: AlertButton[]
};

export type Alert = {
    uuid: UUID,
    type: AlertType,
    duration: number,
    timeoutId: NodeJS.Timeout | null,
    title: string,
    message: string,
    imgUrl: string | null,
    onClickAction: Action | null,
    buttons: AlertButton[],
    fading: boolean,
    hovered: boolean
};

export type AlertState = {
    alerts: Alert[]
};

export type SubmitAlertAction = {
    type: AlertActions.Submit,
    alert: Alert,
};

export type UpdateAlertAction = {
    type: AlertActions.Update,
    alert: Alert,
};

export type RemoveAlertAction = {
    type: AlertActions.Remove,
    uuid: string,
};

export type AlertActionType = SubmitAlertAction | UpdateAlertAction | RemoveAlertAction;