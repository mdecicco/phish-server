import API from '@api';
import { genUUID } from '@utils';
import * as Constants from '@constants';
import update from 'immutability-helper';
import * as Redux from 'react-redux';

describe('Test submitAlert', () => {
    const { submitAlert, AlertActions, AlertType } = API.Alerts;
    const defaults = submitAlert({ title: '' });

    it('Has correct action type', () => {
        expect(defaults.type).toEqual(AlertActions.Submit);
    });

    it('Does not assign uuid field', () => {
        expect(defaults.alert.uuid).toEqual('');
    });

    it('Uses Constants.DefaultAlertDuration for default duration', () => {
        expect(defaults.alert.duration).toEqual(Constants.DefaultAlertDuration);
    });

    it('Uses AlertType.Info for default type', () => {
        expect(defaults.alert.type).toEqual(AlertType.Info);
    });

    it('Does not contain pointers to input data', () => {
        const dummyAction = submitAlert({ title: '' });
        const dummyButtonProps = { confirm: true };

        const { alert } = submitAlert({
            title: '',
            onClickAction: dummyAction,
            buttons: [{
                label: '',
                action: dummyAction,
                buttonProps: dummyButtonProps
            }]
        });

        expect(alert.onClickAction === dummyAction).toBeFalsy();
        expect(alert.buttons[0].action === dummyAction).toBeFalsy();
        expect(alert.buttons[0].buttonProps === dummyButtonProps).toBeFalsy();
    });
});

describe('Test updateAlert', () => {
    const { submitAlert, updateAlert, AlertActions } = API.Alerts;

    it('Has correct action type', () => {
        const { alert } = submitAlert({ title: '' });
        const action = updateAlert(alert);
        expect(action.type).toEqual(AlertActions.Update);
    });

    it('Does not contain pointers to input data', () => {
        const { alert } = submitAlert({
            title: '',
            onClickAction: submitAlert({ title: '' }),
            buttons: [{
                label: '',
                action: submitAlert({ title: '' }),
                buttonProps: { confirm: true }
            }]
        });
        const action = updateAlert(alert);
        expect(action.alert === alert).toBeFalsy();
        expect(action.alert.onClickAction === alert.onClickAction).toBeFalsy();
        expect(action.alert.buttons === alert.buttons).toBeFalsy();
        expect(action.alert.buttons[0] === alert.buttons[0]).toBeFalsy();
        expect(action.alert.buttons[0].action === alert.buttons[0].action).toBeFalsy();
        expect(action.alert.buttons[0].buttonProps === alert.buttons[0].buttonProps).toBeFalsy();
    });

    it('Output alert data matches inputs', () => {
        const { alert } = submitAlert({ title: '' });
        const action = updateAlert(alert);
        expect(action.alert).toEqual(alert);
    });
});

describe('Test removeAlert', () => {
    const { removeAlert, AlertActions } = API.Alerts;

    it('Has correct action type', () => {
        const action = removeAlert('');
        expect(action.type).toEqual(AlertActions.Remove);
    });

    it('Has correct UUID', () => {
        const uuid = genUUID();
        const action = removeAlert(uuid);
        expect(action.uuid).toEqual(uuid);
    });
});

describe('Test Submit Action', () => {
    const { Reduce, submitAlert } = API.Alerts;

    it('Submit action adds alert data to the state', () => {
        const submitAction = submitAlert({ title: '' });
        const state = Reduce(undefined, submitAction);
        expect(state.alerts).toHaveLength(1);

        const alert = Object.assign({}, submitAction.alert, { uuid: state.alerts[0].uuid });
        expect(state.alerts[0]).toEqual(alert);
    });

    it('Submit action assigns alert to valid uuid', () => {
        const submitAction = submitAlert({ title: '' });
        const state = Reduce(undefined, submitAction);
        expect(state.alerts).toHaveLength(1);
        expect(state.alerts[0].uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
});

describe('Test Update Action', () => {
    const { Reduce, submitAlert, updateAlert, AlertType } = API.Alerts;
    it('Update action updates alert values', () => {
        const submitAction = submitAlert({ title: '' });
        let state = Reduce(undefined, submitAction);

        // Can't test timeoutId because in node environment the result of setTimeout is
        // an object with a circular structure, but in a browser environment the result
        // is a number
        // const dummyTimeoutId = setTimeout(() => { 1 + 1; }, 1);
        const updateAction = updateAlert(update(state.alerts[0], {
            title: { $set: 'title' },
            type: { $set: AlertType.Warning },
            duration: { $set: 3.0 },
            // timeoutId: { $set: dummyTimeoutId },
            message: { $set: 'message' },
            imgUrl: { $set: 'url' },
            onClickAction: { $set: submitAction },
            buttons: {
                $push: [{
                    label: 'label',
                    action: submitAction
                }]
            },
            fading: { $set: true },
            hovered: { $set: true }
        }));

        state = Reduce(state, updateAction);
        expect(state.alerts[0].title).toBe('title');
        expect(state.alerts[0].type).toEqual(AlertType.Warning);
        expect(state.alerts[0].duration).toEqual(3.0);
        // expect(state.alerts[0].timeoutId).toEqual(dummyTimeoutId);
        expect(state.alerts[0].message).toBe('message');
        expect(state.alerts[0].imgUrl).toBe('url');
        expect(state.alerts[0].onClickAction).toEqual(submitAction);
        expect(state.alerts[0].buttons).toEqual([{
            label: 'label',
            action: submitAction,
            buttonProps: undefined
        }]);
        expect(state.alerts[0].fading).toEqual(true);
        expect(state.alerts[0].hovered).toEqual(true);
    });

    it('Update action updates the correct alert', () => {
        const submitAction = submitAlert({ title: '' });
        let state = Reduce(undefined, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);

        // There should now be 5 similar alerts in the state, all with different UUIDs

        const alert = update(state.alerts[2], {
            title: { $set: 'title' }
        });

        state = Reduce(state, updateAlert(alert));
        expect(state.alerts[0].title).toBe('');
        expect(state.alerts[1].title).toBe('');
        expect(state.alerts[2].title).toBe('title');
        expect(state.alerts[3].title).toBe('');
        expect(state.alerts[4].title).toBe('');
    });

    it('Update action does nothing and does not error if an invalid alert is specified', () => {
        const submitAction = submitAlert({ title: '' });
        let state = Reduce(undefined, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);

        // There should now be 5 similar alerts in the state, all with different UUIDs

        // clone alerts to check that nothing was modified at all
        const oldAlerts = state.alerts.map(a => JSON.parse(JSON.stringify(a)));

        const alert = update(state.alerts[2], {
            uuid: { $set: '' },
            title: { $set: 'title' }
        });

        state = Reduce(state, updateAlert(alert));
        expect(state.alerts).toEqual(oldAlerts);
    });
});

describe('Test Remove Action', () => {
    const { Reduce, submitAlert, removeAlert } = API.Alerts;
    it('Remove action removes the correct alert', () => {
        const submitAction = submitAlert({ title: '' });
        let state = Reduce(undefined, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);

        // There should now be 5 similar alerts in the state, all with different UUIDs

        const uuidToRemove = state.alerts[2].uuid;
        const otherIds = state.alerts.map(a => a.uuid).filter(id => id !== uuidToRemove);

        state = Reduce(state, removeAlert(uuidToRemove));
        const newIds = state.alerts.map(a => a.uuid);
        expect(state.alerts).toHaveLength(4);

        expect(newIds).not.toContain(uuidToRemove);
        expect(newIds).toContain(otherIds[0])
        expect(newIds).toContain(otherIds[1])
        expect(newIds).toContain(otherIds[2])
        expect(newIds).toContain(otherIds[3])
    });

    it('Remove action does nothing and does not error if an invalid uuid is specified', () => {
        const submitAction = submitAlert({ title: '' });
        let state = Reduce(undefined, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);
        state = Reduce(state, submitAction);

        // There should now be 5 similar alerts in the state, all with different UUIDs

        // clone alerts to check that nothing was modified at all
        const oldAlerts = state.alerts.map(a => JSON.parse(JSON.stringify(a)));

        state = Reduce(state, removeAlert(''));
        expect(state.alerts).toEqual(oldAlerts);
    });
});

/*
describe('Test useSubmitAlert', () => {
    it('Is called with the correct parameters', () => {
        const spy = jest.spyOn(Redux, 'useDispatch');
        const mockDispatch = jest.fn();
        spy.mockReturnValue(mockDispatch);

        const submitAlert = API.Alerts.useSubmitAlert();
        const dummyAction = API.Alerts.submitAlert({ title: '' });
        const dummyButtonProps = { confirm: true };
        submitAlert({
            type: API.Alerts.AlertType.Warning,
            duration: 2.5,
            title: 'Uh oh',
            message: 'A thing happened',
            imgUrl: 'https://uh-oh.org/img?id=69',
            onClickAction: dummyAction,
            buttons: [{
                label: '',
                action: dummyAction,
                buttonProps: dummyButtonProps
            }]
        });

        const dispatchParam = API.Alerts.submitAlert({
            type: API.Alerts.AlertType.Warning,
            duration: 2.5,
            title: 'Uh oh',
            message: 'A thing happened',
            imgUrl: 'https://uh-oh.org/img?id=69',
            onClickAction: dummyAction,
            buttons: [{
                label: '',
                action: dummyAction,
                buttonProps: dummyButtonProps
            }]
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining(dispatchParam)
        );

        spy.mockClear();
    });
});
*/

describe('Test useUpdateAlert', () => {
    it('Is called with the correct parameters', () => {
        const spy = jest.spyOn(Redux, 'useDispatch');
        const mockDispatch = jest.fn();
        spy.mockReturnValue(mockDispatch);

        const updateAlert = API.Alerts.useUpdateAlert();
        const { alert } = API.Alerts.submitAlert({ title: '' });

        updateAlert(alert);

        const dispatchParam = API.Alerts.updateAlert(alert);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining(dispatchParam)
        );

        spy.mockClear();
    });
});

describe('Test useRemoveAlert', () => {
    it('Is called with the correct parameters', () => {
        const spy = jest.spyOn(Redux, 'useDispatch');
        const mockDispatch = jest.fn();
        spy.mockReturnValue(mockDispatch);

        const removeAlert = API.Alerts.useRemoveAlert();

        const dummyUUID = genUUID();
        removeAlert(dummyUUID);

        const dispatchParam = API.Alerts.removeAlert(dummyUUID);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining(dispatchParam)
        );

        spy.mockClear();
    });
});