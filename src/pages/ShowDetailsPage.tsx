import * as React from 'react';
import { Page, PlayerInterface, Navigator } from '@components';
import { ErrorPage, LoadingPage } from '@pages';
import styled, { keyframes } from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import {
    Request,
    RequestResult,
    serverUrl,
    coverArtUrl,
    showDate,
    showLocation,
    formatDuration
} from '@utils';
import { DetailedShow, ShowTrack } from '@types';
import API from '@api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { playNext } from 'src/api/player/actions';

const DetailsHeader = styled.div`
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    padding: 0.5em;
    background-color: rgba(0, 0, 0, 0.2);
`;
const CoverArt = styled.img`
    width: 10em;
    height: 10em;
`;
const DetailsHeaderInfo = styled.div`
    display: flex;
    flex-flow: column;
    font-family: monospace;
`;
const InfoTitle = styled.span`
    color: white;
    font-size: 1.5em;
    margin-bottom: 0.5em;
`;
const InfoText = styled.span`
    color: white;
    opacity: 0.5;
    font-size: 0.9em;
`;
const InfoArtists = styled.span`
    color: orange;
    opacity: 0.5;
    font-size: 1.0em;
`;
const InfoNotes = styled.div`
    color: white;
    margin-top: 1.1em;
    opacity: 0.5;
    font-size: 0.9em;
`;
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

const ShowDetailsPage : React.FC = () => {
    const { play, currentTrack, playPrompt } = API.Player.use();
    const [loading, setLoading] = React.useState(true);
    const [show, setShow] = React.useState<DetailedShow | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [linkId, setLinkId] = React.useState<number>(0);
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const { Error } = API.Alerts.use();
    React.useEffect(() => {
        Request.get(serverUrl(`/api/shows/${id}`)).then((r: RequestResult) => {
            if (r.errored) {
                Error({
                    title: 'Sorry, but...',
                    message: 'The show failed to load',
                    duration: 5
                });
                setError(`An error occurred: ${r.status}`);
                setLoading(false);
            } else {
                if (r.result.error) {
                    Error({
                        title: 'Sorry, but...',
                        message: 'The show failed to load',
                        duration: 5
                    });
                    setError(r.result.error);
                    setLoading(false);
                } else {
                    console.log(r.result);
                    setLinkId(r.result.show.links.length > 0 ? r.result.show.links[0].id : 0);
                    setShow(r.result.show);
                    setLoading(false);
                }
            }
        });
    }, [id]);

    if (loading) return (<LoadingPage/>);
    if (!show) return (<ErrorPage message={error || 'Error: Error not found'}/>);

    const tracks = linkId > 0 ? show.tracks[linkId] : [];
    return (
        <Page
            style={{ display: 'flex', flexDirection: 'column' }}
            noMargin
            noRootContextMenu
        >
            <Navigator/>
            <DetailsHeader>
                <DetailsHeaderInfo>
                    <InfoArtists>{show.artists}</InfoArtists>
                    <InfoTitle>{show.venue ? show.venue : showLocation(show)}</InfoTitle>
                    <InfoText>{showDate(show)}</InfoText>
                    <InfoText>{show.venue ? showLocation(show) : ''}</InfoText>
                    <InfoText>{show.track_count} Track{show.track_count === 1 ? '' : 's'}</InfoText>
                    <InfoText>{formatDuration(show.duration, true)}</InfoText>
                    <InfoText>{show.source && show.source.length > 0 ? `Source: ${show.source}` : ''}</InfoText>
                    <InfoText>{show.is_sbd ? 'Soundboard' : ''}</InfoText>
                    <InfoNotes>{show.notes}</InfoNotes>
                </DetailsHeaderInfo>
                <CoverArt src={coverArtUrl(show.cover_art_id)}/>
            </DetailsHeader>
            <TrackList>
                <TrackRow style={{ backgroundColor: '#4d4d4d' }} onClick={() => { playPrompt(tracks); }}>
                    <TrackInfo>
                        <TrackTitle>Play All</TrackTitle>
                        <TrackDuration>{formatDuration(show.duration)}</TrackDuration>
                    </TrackInfo>
                </TrackRow>
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

export default ShowDetailsPage;