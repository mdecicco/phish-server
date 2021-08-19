import styled from 'styled-components';

export const PlayerDiv = styled.div`
    width: 100vw;
    min-height: 8em;
    max-height: 8em;
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.2);
    border-top: 1px solid #303030;
`;
export const PlayerCoverArt = styled.img`
    width: 4.5em;
    height: 4.5em;
    margin: 0.25em;
`;
export const PlayerRightPane = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.3em 0 0.3em 0;
    font-family: monospace;
    flex-grow: 1;
`;
export const PlayerTrackInfo = styled.div`
    display: flex;
    flex-direction: column;
`;
export const PlayerTrackInfoTitle = styled.span`
    font-size: 1.2em;
    color: white;
`;
export const PlayerTrackInfoLine = styled.span`
    color: #979797;
`;
export const PlayerTrackInfoDate = styled.span`
    font-size: 0.9em;
    color: orange;
`;
export const PlayerProgress = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;
export const PlayerProgressTime = styled.span`
    font-size: 0.9em;
    color: orange;
    width: 3.25em;
    text-align: center;
`;
export const PlayerProgressBarOuter = styled.div`
    height: 1.25em;
    background-color: #2a2a2a;
    border-radius: 0.5125em;
    overflow: hidden;
`;
export const PlayerProgressBarInnerAnimated = styled.div`
    background-color: orange;
    height: 1.25em;
    pointer-events: none;
    transition: width 1s linear;
`;
export const PlayerProgressBarInner = styled.div`
    background-color: orange;
    height: 1.25em;
    pointer-events: none;
`;
export const VAlignCenter = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 1.25em;
`;
export const Row = styled.div`
    display: flex;
    flex-direction: row;
`;
export const PlayerControls = styled.div`
    min-height: 3em;
    max-height: 3em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;
export const ControlButton = styled.div`
    min-height: 2.4em;
    max-height: 2.4em;
    min-width: 2.4em;
    max-width: 2.4em;
    margin: 0.2em;
    border-radius: calc(1.2em + 1px);
    border: 1px solid #5a5a5a;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: background-color 125ms;

    :active {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;
export const ArrowRight = styled.div`
    border-bottom: 1px solid orange;
    border-right: 1px solid orange;
    width: 0.5em;
    height: 0.5em;
    position: relative;
    left: -0.25em;
    top: -0.05em;
    transform: rotate(-45deg);
    margin-left: 1.3em;
    font-family: monospace;
`;
export const ArrowLeft = styled.div`
    border-bottom: 1px solid orange;
    border-right: 1px solid orange;
    width: 0.5em;
    height: 0.5em;
    position: relative;
    left: -0.25em;
    top: -0.05em;
    transform: rotate(135deg);
    margin-left: 1.6em;
    font-family: monospace;
`;
export const Pause = styled.div`
    border-left: 1px solid orange;
    border-right: 1px solid orange;
    width: 0.6em;
    height: 1.0em;
    position: relative;
    left: 1.1em;
    top: -0.05em;
    font-family: monospace;
`;