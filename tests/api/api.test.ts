import API from '@api';

describe('Test exports', () => {
    it('API should be exported', () => {
        expect(API).not.toBe(undefined);
    });
    it('API.createStore should be exported', () => {
        expect(API).toHaveProperty('createStore');
        expect(API.createStore).toBeInstanceOf(Function);
    });
    it('API.Alerts.use should be exported', () => {
        expect(API.Alerts).toHaveProperty('use');
        expect(API.Alerts.use).toBeInstanceOf(Function);
    });
    it('API.Alerts.useUpdateAlert should be exported', () => {
        expect(API.Alerts).toHaveProperty('useUpdateAlert');
        expect(API.Alerts.useUpdateAlert).toBeInstanceOf(Function);
    });
    it('API.Alerts.useRemoveAlert should be exported', () => {
        expect(API.Alerts).toHaveProperty('useRemoveAlert');
        expect(API.Alerts.useRemoveAlert).toBeInstanceOf(Function);
    });
    it('API.Alerts.submitAlert should be exported', () => {
        expect(API.Alerts).toHaveProperty('submitAlert');
        expect(API.Alerts.submitAlert).toBeInstanceOf(Function);
    });
    it('API.Alerts.updateAlert should be exported', () => {
        expect(API.Alerts).toHaveProperty('updateAlert');
        expect(API.Alerts.updateAlert).toBeInstanceOf(Function);
    });
    it('API.Alerts.removeAlert should be exported', () => {
        expect(API.Alerts).toHaveProperty('removeAlert');
        expect(API.Alerts.removeAlert).toBeInstanceOf(Function);
    });
    it('API.Alerts.Reduce should be exported', () => {
        expect(API.Alerts).toHaveProperty('Reduce');
        expect(API.Alerts.Reduce).toBeInstanceOf(Function);
    });
});