import * as React from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faInfoCircle, faExclamationCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import update from 'immutability-helper';

import API, { Alert, AlertType } from '@api';
import * as Constants from '@constants';
import { UUID } from '@utils';

import Flex from './Flex';
import ContextMenu from './ContextMenu';
import Button from './Button';
import {
    Container,
    AlertBox,
    AlertTitle,
    AlertMessage,
    AlertTimerBox,
    AlertImg,
    AlertIconContainer,
    ButtonDrawer,
    CloseButtonWrapper
} from './styled/AlertPresenter';

type AlertIconProps = {
    type: AlertType
};

const AlertIcon = (props: AlertIconProps) => {
    let icon = faInfoCircle;
    let color = '#301f00';
    if (props.type === API.Alerts.AlertType.Warning) {
        icon = faExclamationCircle;
        color = '#ffe000';
    }
    else if (props.type === API.Alerts.AlertType.Error) {
        icon = faExclamationTriangle;
        color = '#c40000';
    }

    return (
        <AlertIconContainer style={{ color }}>
            <FontAwesomeIcon icon={icon}/>
        </AlertIconContainer>
    );
};

const AlertPresenter : React.FC = () => {
    const { state } = API.Alerts.use();
    const { alerts } = state;
    const dispatch = useDispatch();

    const removeAlert = API.Alerts.useRemoveAlert();
    const updateAlert = API.Alerts.useUpdateAlert();

    const animateRemoveAlert = React.useCallback((uuid: UUID) => {
        const a = alerts.find(c => c.uuid === uuid);
        if (a) {
            // Make it fade out
            updateAlert(update(a, {
                fading: { $set: true }
            }));

            // Remove it after the fading animation completes
            setTimeout(() => {
                removeAlert(uuid);
            }, Constants.AlertFadeDuration);
        }
    }, [alerts, removeAlert, updateAlert]);
    
    const alertMouseOver = React.useCallback((uuid: UUID) => {
        const a = alerts.find(c => c.uuid === uuid);
        if (!a || a.fading) return;
        if (a.timeoutId) clearTimeout(a.timeoutId);
        updateAlert(update(a, {
            timeoutId: { $set: null },
            hovered: { $set: true }
        }));
    }, [alerts, updateAlert]);

    const alertMouseOut = React.useCallback((uuid: UUID) => {
        const a = alerts.find(c => c.uuid === uuid);
        if (!a || !a.hovered || a.fading) return;

        const timeoutId = a.duration > 0.0 ? setTimeout(() => { animateRemoveAlert(a.uuid); }, a.duration * 1000) : null;
        updateAlert(update(a, {
            timeoutId: { $set: timeoutId },
            hovered: { $set: false }
        }));
    }, [alerts, updateAlert, animateRemoveAlert]);
    
    const pinAlert = React.useCallback((alerts: Alert[], uuid: UUID) => {
        const a = alerts.find(c => c.uuid === uuid);
        if (!a || a.fading) return;
        if (a.timeoutId) clearTimeout(a.timeoutId);
        updateAlert(update(a, {
            timeoutId: { $set: null },
            duration: { $set: 0 }
        }));
    }, [updateAlert]);

    React.useEffect(() => {
        alerts.forEach(a => {
            if (a.duration > 0 && a.timeoutId === null && !a.hovered) {
                const timeoutId = setTimeout(() => { animateRemoveAlert(a.uuid); }, a.duration * 1000);
                updateAlert(update(a, {
                    timeoutId: { $set: timeoutId }
                }));
            }
        });
    }, [alerts, updateAlert, animateRemoveAlert]);

    let verticalOffset = 10; // px
    return (
        <Container>
            <Flex mode={Flex.Mode.Vertical}>
                {alerts.map(a => {
                    const cVOff = verticalOffset;
                    verticalOffset += Constants.AlertHeight + 10;
                    let height = Constants.AlertHeight;
                    if (a.buttons.length > 0 && a.hovered) {
                        verticalOffset += Constants.ButtonRowHeight + Constants.ButtonRowMargin;
                        height += Constants.ButtonRowHeight + Constants.ButtonRowMargin;
                    }
                    const options = [];
                    if (a.duration !== 0) options.push({ label: 'Pin', onClick: () => { pinAlert(alerts, a.uuid); } });
                    options.push({ label: 'Dismiss', onClick: () => { animateRemoveAlert(a.uuid); } });
                    return (
                        <ContextMenu
                            menuId={`ctx_${a.uuid}`}
                            key={a.uuid}
                            items={options}
                        >
                            <AlertBox
                                style={{
                                    top: `${cVOff}px`,
                                    opacity: a.fading ? 0 : 1,
                                    minHeight: `${height}px`,
                                    maxHeight: `${height}px`,
                                    height: `${height}px`,
                                }}
                                onMouseEnter={() => alertMouseOver(a.uuid)}
                                onMouseLeave={() => alertMouseOut(a.uuid)}
                                onClick={() => {
                                    if (a.onClickAction) dispatch(a.onClickAction);
                                }}
                            >
                                <Flex mode={Flex.Mode.Horizontal}>
                                    {a.imgUrl ? (
                                        <AlertImg src={a.imgUrl}/>
                                    ) : (
                                        <AlertIcon type={a.type}/>
                                    )}
                                    <Flex mode={Flex.Mode.Vertical}>
                                        <AlertTitle>{a.title}</AlertTitle>
                                        <AlertMessage>{a.message}</AlertMessage>
                                        {a.timeoutId && !a.fading && (<AlertTimerBox duration={a.duration}/>)}
                                    </Flex>
                                </Flex>
                                <ButtonDrawer>
                                    {a.buttons.map((b, idx) => (
                                        <Button
                                            key={idx}
                                            label={b.label}
                                            buttonStyle={{ borderColor: 'rgba(100, 64, 0, 0.73)', marginLeft: idx > 0 ? '0.25em' : '' }}
                                            labelStyle={{ color: 'rgba(100, 64, 0, 0.73)' }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (b.action) {
                                                    dispatch(b.action);
                                                    if (b.closeOnClick) animateRemoveAlert(a.uuid);
                                                } else animateRemoveAlert(a.uuid);
                                            }}
                                            {...b.buttonProps}
                                        />
                                    ))}
                                </ButtonDrawer>
                                {a.hovered && (
                                    <CloseButtonWrapper
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            animateRemoveAlert(a.uuid);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTimes}/>
                                    </CloseButtonWrapper>
                                )}
                            </AlertBox>
                        </ContextMenu>
                    );
                })}
            </Flex>
        </Container>
    );
};

export default AlertPresenter;