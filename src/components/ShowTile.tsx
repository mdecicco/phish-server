import * as React from 'react';
import styled from 'styled-components';
import { showDate, showLocation, serverUrl } from '@utils';
import { Show } from '@types';

type ShowProps = {
    show: Show
};

const ShowSize = '150px';

const ShowDiv = styled.div`
    width: ${ShowSize};
    min-width: ${ShowSize};
    max-width: ${ShowSize};
    height: ${ShowSize};
    min-height: ${ShowSize};
    max-height: ${ShowSize};
    margin: 10px;
    overflow: hidden;
    position: relative;
`;
const CoverImg = styled.img`
    width: ${ShowSize};
    min-width: ${ShowSize};
    max-width: ${ShowSize};
    height: ${ShowSize};
    min-height: ${ShowSize};
    max-height: ${ShowSize};
`;
const ShowInfo = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    width: ${ShowSize};
    min-width: ${ShowSize};
    max-width: ${ShowSize};
    height: ${ShowSize};
    min-height: ${ShowSize};
    max-height: ${ShowSize};
    padding: 5px;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.75);
    transition: opacity 125ms linear;
    color: orange;
    cursor: pointer;
    font-family: monospace;
            
    &:hover {
        opacity: 1;
    }
`;
const ShowInfoInner = styled.div`
    width: calc(${ShowSize} - 10px);
    height: calc(${ShowSize} - 10px);
    display: flex;
    flex-direction: column; 
`;
const ShowDate = styled.div`
    font-size: 24px;
`;
const ShowLocation = styled.div`
`;
const ShowSpace = styled.div`
    flex-grow: 1;
`;
const ShowVenue = styled.div`
`;

const ShowTile : React.FC<ShowProps> = (props: ShowProps) => {
    const s = props.show;
    return (
        <ShowDiv>
            <CoverImg src={serverUrl(`/api/covers/${s.cover_art_id}`)}/>
            <ShowInfo>
                <ShowInfoInner>
                    <ShowDate>{showDate(s)}</ShowDate>
                    <ShowLocation>{showLocation(s)}</ShowLocation>
                    <ShowSpace/>
                    <ShowVenue>{s.venue || ''}</ShowVenue>
                </ShowInfoInner>
            </ShowInfo>
        </ShowDiv>
    );
};

export default ShowTile;