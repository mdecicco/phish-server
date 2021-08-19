import styled, { keyframes } from 'styled-components';
import * as Constants from '@constants';

export const Container = styled.div`
    position: absolute;
    pointer-events: none;
    top: 0px;
    right: 0px;
    min-width: ${Constants.AlertWidth + 20}px;
    max-width: ${Constants.AlertWidth + 20}px;
    width: ${Constants.AlertWidth + 20}px;
    height: 100vh;
    overflow-y: hidden;
`;

const AlertFadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

export const AlertBox = styled.div`
    position: absolute;
    left: 10px;
    min-width: ${Constants.AlertWidth}px;
    max-width: ${Constants.AlertWidth}px;
    width: ${Constants.AlertWidth}px;
    transition: top ${Constants.AlertSlideDuration}ms ease-in-out,
                height ${Constants.AlertSlideDuration}ms ease-in-out,
                min-height ${Constants.AlertSlideDuration}ms ease-in-out,
                max-height ${Constants.AlertSlideDuration}ms ease-in-out,
                opacity ${Constants.AlertFadeDuration}ms ease-in-out,
                background-color 125ms,
                box-shadow 125ms;
    animation-name: ${AlertFadeIn};
    animation-duration: ${Constants.AlertFadeDuration}ms;
    animation-iteration-count: 1;
    box-shadow: 3px 3px 6px 0px black;
    background-color: #bda07c;
    color: #301f00;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    pointer-events: all;
    cursor: pointer;
    overflow-y: hidden;
    z-index: 3;

    &:hover {
        background-color: #c5ab8c;
        
        &:active {
            background-color: #bda07c;
            box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 0.5);
        }
    }
`;

export const AlertTitle = styled.span`
    pointer-events: none;
    font-size: ${Constants.AlertTitleSize}px;
    font-family: sans-serif;
    margin: ${Constants.AlertTitleMargin}px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

export const AlertMessage = styled.div`
    pointer-events: none;
    font-size: 12px;
    font-family: sans-serif;
    margin: 0px 5px 5px 5px;
    max-width: ${Constants.AlertWidth - (Constants.AlertHeight + 10)}px;
    min-width: ${Constants.AlertWidth - (Constants.AlertHeight + 10)}px;
    width: ${Constants.AlertWidth - (Constants.AlertHeight + 10)}px;
    text-overflow: ellipsis;
    overflow: hidden;
    min-height: ${Constants.AlertHeight - (Constants.AlertTitleSize + (2 * Constants.AlertTitleMargin) + Constants.AlertTimerHeight + (2 * Constants.AlertTimerVMargin))}px;
    max-height: ${Constants.AlertHeight - (Constants.AlertTitleSize + (2 * Constants.AlertTitleMargin) + Constants.AlertTimerHeight + (2 * Constants.AlertTimerVMargin))}px;
    height: ${Constants.AlertHeight - (Constants.AlertTitleSize + (2 * Constants.AlertTitleMargin) + Constants.AlertTimerHeight + (2 * Constants.AlertTimerVMargin))}px;
`;

interface AlertTimerProps {
    duration: number;
};

const DurationVariantDiv = styled.div.attrs((props: AlertTimerProps) => ({
    duration: props.duration
}));

const TimerShrink = keyframes`
    from {
        min-width: ${Constants.AlertWidth - (Constants.AlertHeight + 5)}px;
        max-width: ${Constants.AlertWidth - (Constants.AlertHeight + 5)}px;
        width: ${Constants.AlertWidth - (Constants.AlertHeight + 5)}px;
    }
    to {
        min-width: 0px;
        max-width: 0px;
        width: 0px;
    }
`;

export const AlertTimerBox = DurationVariantDiv`
    pointer-events: none;
    min-height: ${Constants.AlertTimerHeight}px;
    max-height: ${Constants.AlertTimerHeight}px;
    height: ${Constants.AlertTimerHeight}px;
    background-color: red;
    animation-name: ${TimerShrink};
    animation-duration: ${(props) => props.duration}s;
    animation-iteration-count: 1;
    animation-timing-function: linear;
`;

export const AlertImg = styled.img`
    width: ${Constants.AlertHeight - 10}px;
    height: ${Constants.AlertHeight - 10}px;
    margin: 5px;
    border-radius: 5px;
`;

export const AlertIconContainer = styled.div`
    width: ${Constants.AlertHeight - 10}px;
    height: ${Constants.AlertHeight - 10}px;
    margin: 5px;
    border-radius: 5px;
    font-size: 40px;
    line-height: 60px;
    text-align: center;
`;

export const ButtonDrawer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 5px;
`;

export const CloseButtonWrapper = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    padding: 2px 5px 0px 0px;
    color: rgba(100, 64, 0, 0.73);
    font-size: 16px;
    width: 24px;
    height: 24px;
    text-align: right;
    transition: color 125ms;

    &:hover {
        color: rgba(28, 18, 0, 0.73);
    }
`;