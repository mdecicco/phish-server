import { submitAlert, updateAlert, removeAlert } from './actions';
import { AlertState, SubmitAlertParams, Alert, AlertType } from './types';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { UUID } from '@utils';

type UseAlertsResult = {
    state: AlertState,
    Alert: (options: SubmitAlertParams) => void,
    Warn: (options: SubmitAlertParams) => void,
    Error: (options: SubmitAlertParams) => void,
};

export function useAlerts() : UseAlertsResult {
    const state = useSelector((state: { alerts: AlertState }) : AlertState => state.alerts, shallowEqual);
    const dispatch = useDispatch();

    const submit = (type: AlertType) => (options: SubmitAlertParams) => {
        dispatch(submitAlert(Object.assign({ type }, options)));
    };
    
    return {
        state,
        Alert: submit(AlertType.Info),
        Warn: submit(AlertType.Warning),
        Error: submit(AlertType.Error)
    };
}

/**
 * Returns a function which dispatches an action to update an alert in the redux state. A
 * full alert body must be provided as an argument to the returned function, and the
 * corresponding alert in the redux state will be overwritten entirely by it.
 *
 * @export
 * @return {*}  {(alert: Alert) => void}
 */
export function useUpdateAlert() : (alert: Alert) => void {
    const dispatch = useDispatch();

    return (alert: Alert) : void => {
        dispatch(updateAlert(alert));
    };
}

/**
 * Returns a function which dispatches an action to remove an alert from the redux state with
 * the provided UUID.
 *
 * @export
 * @return {*}  {(id: UUID) => void}
 */
export function useRemoveAlert() : (id: UUID) => void {
    const dispatch = useDispatch();

    return (id: UUID) : void => {
        dispatch(removeAlert(id));
    };
}