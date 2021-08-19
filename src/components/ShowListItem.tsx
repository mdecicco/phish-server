import * as React from 'react';
import styled from 'styled-components';
import { ContextMenu } from '@components';
import { showDate, showLocation, serverUrl, formatDuration } from '@utils';
import { Show } from '@types';
import API from '@api';
import { ContextMenuItem } from './ContextMenu';

type ShowProps = {
    show: Show,
    viewDetails: () => void
};

const ShowDiv = styled.div`
    display: flex;
    flex-direction: row;
    cursor: pointer;
    :nth-child(even) {
        background-color: rgba(0, 0, 0, 0.1);
    }
`;
const ShowCover = styled.img`
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

type MenuItems = ({ label: string, onClick: () => void })[];
const ShowListItem : React.FC<ShowProps> = (props: ShowProps) => {
    const { queue, addToQueue, playNext } = API.Player.use();
    const s = props.show;
    const contextItems: MenuItems = [];

    if (queue.length > 0) {
        contextItems.push({
            label: 'Play Next',
            onClick: () => { playNext(s) }
        });
        contextItems.push({
            label: 'Add to Queue',
            onClick: () => { addToQueue(s) }
        });
    } else {
        contextItems.push({
            label: 'Play',
            onClick: () => { playNext(s) }
        });
    }

    contextItems.push({
        label: 'View Details',
        onClick: props.viewDetails
    });

    return (
        <ContextMenu menuId='showListItem' items={contextItems}>
            <ShowDiv onClick={props.viewDetails}>
                <ShowCover src={serverUrl(`/api/covers/${s.cover_art_id}`)}/>
                <InfoDiv>
                    <InfoTitle>{s.venue ? s.venue : showLocation(s)}</InfoTitle>
                    <InfoText>{showDate(s)}</InfoText>
                    <InfoText>{s.venue ? showLocation(s) : ''}</InfoText>
                    <InfoText>{s.track_count} Track{s.track_count === 1 ? '' : 's'}, {formatDuration(s.duration, true)}</InfoText>
                </InfoDiv>
            </ShowDiv>
        </ContextMenu>
    );
};

export default ShowListItem;