import * as React from 'react';
import styled from 'styled-components';
import { ContextMenu } from '@components';
import { showDate, showLocation, serverUrl, formatDuration, coverArtUrl } from '@utils';
import { ShowTrack } from '@types';
import API from '@api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneAlt } from '@fortawesome/free-solid-svg-icons';

type TrackProps = {
    track: ShowTrack
};

const TrackDiv = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    :nth-child(even) {
        background-color: rgba(0, 0, 0, 0.1);
    }
`;
const TrackCover = styled.img`
    width: 4em;
    height: 4em;
    margin: 0.3em;
`;
const InfoDiv = styled.div`
    display: flex;
    flex-direction: column;
    font-family: monospace;
    margin: 0.3em 0px 0.3em 0.3em;
    justify-content: center;
    flex-grow: 1;
    min-width: 0;
`;
const InfoTitle = styled.span`
    color: white;
    font-size: 1.2em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;
const InfoText = styled.span`
    color: white;
    opacity: 0.5;
    font-size: 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;
const SBDIcon = styled.div`
    position: absolute;
    left: 0.5em;
    top: 0.5em;
    color: orange;
`;

type MenuItems = ({ label: string, onClick: () => void, tip?: string })[];
const TrackListItem : React.FC<TrackProps> = (props: TrackProps) => {
    const { queue, addToQueue, playNext, playNow, playPrompt } = API.Player.use();
    const t = props.track;
    const contextItems: MenuItems = [];

    if (queue.length > 0) {
        contextItems.push({
            label: 'Play Now',
            tip: 'Clears Queue',
            onClick: () => { playNow([t]) }
        });
        contextItems.push({
            label: 'Play Next',
            onClick: () => { playNext([t]) }
        });
        contextItems.push({
            label: 'Add to Queue',
            onClick: () => { addToQueue([t]) }
        });
    } else {
        contextItems.push({
            label: 'Play',
            onClick: () => { playNext([t]) }
        });
    }

    return (
        <ContextMenu menuId={`tli-${t.id}`} items={contextItems}>
            <TrackDiv onClick={() => { console.log(t.id, t.title); playPrompt([t]); }}>
                {t.is_sbd ? (
                    <SBDIcon>
                        <FontAwesomeIcon icon={faMicrophoneAlt}/>
                    </SBDIcon>
                ) : null}
                <TrackCover src={coverArtUrl(t.cover_art_id, true)}/>
                <InfoDiv>
                    <InfoTitle>{t.title}</InfoTitle>
                    <InfoText>{showDate(t)}</InfoText>
                    <InfoText>{t.venue ? t.venue : showLocation(t)}</InfoText>
                    <InfoText>{t.venue ? showLocation(t) : ''}</InfoText>
                    <InfoText>{formatDuration(t.duration, true)}</InfoText>
                </InfoDiv>
            </TrackDiv>
        </ContextMenu>
    );
};

export default TrackListItem;