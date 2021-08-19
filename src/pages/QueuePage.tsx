import * as React from 'react';
import { Page, PlayerInterface, Navigator } from '@components';
import styled, { keyframes } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { formatDuration } from '@utils';
import { ShowTrack } from '@types';
import API from '@api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

const TrackList = styled.div`
    background-color: rgba(0, 0, 0, 0.4);
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
`;
const TrackRow = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0.5em;
    transition: opacity 125ms linear;

    :nth-child(even) {
        background-color: rgba(0, 0, 0, 0.2);
    }

    :active {
        opacity: 0.6;
    }
`;
const TrackInfo = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    line-height: 1.1em;
    min-width: 0;
`;
const TrackTitle = styled.span`
    font-size: 1.1em;
    color: white;
    font-family: monospace;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;
const TrackDuration = styled.span`
    font-size: 1.1em;
    color: white;
    font-family: monospace;
`;
const Pulse = keyframes`
    0% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
`;
const TrackListenIcon = styled.div`
    width: 1.1em;
    height: 1.1em;
    margin-right: 0.5em;
    display: inline-block;
    font-size: 1.0em;
    animation: ${Pulse} 2s infinite ease-in-out;
`;
const NoTracksContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
const NoTracks = styled.span`
    text-align: center;
    color: #959595;
    font-size: 1.5em;
    font-family: monospace;
`;

type TrackProps = {
    track: ShowTrack,
    playPrompt: (tracks: ShowTrack[]) => void,
    currentTrack: ShowTrack | null
};

const Track : React.FC<TrackProps> = (props: TrackProps) => {
    const { track, playPrompt, currentTrack } = props;
    const isPlaying = currentTrack && currentTrack.id === track.id;
    return (
        <TrackRow onClick={() => { playPrompt([track]); }}>
            <TrackListenIcon>
                {isPlaying && (<FontAwesomeIcon icon={faMusic} color='orange'/>)}
            </TrackListenIcon>
            <TrackInfo>
                <TrackTitle>{track.title}</TrackTitle>
                <TrackDuration>{formatDuration(track.duration)}</TrackDuration>
            </TrackInfo>
        </TrackRow>
    );
};

const QueuePage : React.FC = () => {
    const { queue, currentTrack, playPrompt } = API.Player.use();
    const tracks = queue;
    if (tracks.length === 0) {
        return (
            <Page
                style={{ display: 'flex', flexDirection: 'column' }}
                noMargin
                noRootContextMenu
            >
                <Navigator/>
                <NoTracksContainer>
                    <NoTracks>No Queued Tracks</NoTracks>
                </NoTracksContainer>
                <PlayerInterface/>
            </Page>
        );
    }

    return (
        <Page
            style={{ display: 'flex', flexDirection: 'column' }}
            noMargin
            noRootContextMenu
        >
            <Navigator/>
            <TrackList>
                {tracks.map(t => (
                    <Track
                        key={t.id}
                        track={t}
                        currentTrack={currentTrack}
                        playPrompt={playPrompt}
                    />
                ))}
            </TrackList>
            <PlayerInterface/>
        </Page>
    );
};

export default QueuePage;