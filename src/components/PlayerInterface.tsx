import * as React from 'react';
import API from '@api';
import { coverArtUrl, formatDuration, isMobile, showDate, showLocation } from '@utils';
import {
    PlayerDiv,
    PlayerCoverArt,
    PlayerRightPane,
    PlayerTrackInfo,
    PlayerTrackInfoTitle,
    PlayerTrackInfoLine,
    PlayerTrackInfoDate,
    PlayerProgress,
    PlayerProgressTime,
    PlayerProgressBarOuter,
    PlayerProgressBarInner,
    PlayerProgressBarInnerAnimated,
    VAlignCenter,
    Row,
    PlayerControls,
    ControlButton
} from './styled/PlayerInterface';

const getClientX = (e: TouchEvent | MouseEvent | (React.TouchEvent<HTMLDivElement> & React.MouseEvent<HTMLDivElement, MouseEvent>)) : number | null => {
    if ((e as MouseEvent).clientX) return (e as MouseEvent).clientX;

    const te = e as TouchEvent;
    if (te.touches.length > 0) return te.touches[0].clientX;

    return null;
};

const PlayerInterface : React.FC = () => {
    const Player = API.Player.use();
    const [seeking, setSeeking] = React.useState(false);
    const eventsBound = React.useRef(false);
    const progressRef = React.useRef<HTMLDivElement | null>(null);
    const lastPercent = React.useRef(0);

    React.useEffect(() => {
        if (!Player.currentTrack) return;

        const track = Player.currentTrack;

        const onSeek = (e: TouchEvent | MouseEvent) => {
            const clientX = getClientX(e);
            if (seeking && progressRef.current && clientX !== null) {
                const ele = progressRef.current;
                const rect = ele.getBoundingClientRect();
                const frac = (clientX - rect.left) / (rect.width);
                Player.seek(frac * track.duration);
            }
        };
        
        const onEndSeeking = (e: TouchEvent | MouseEvent) => {
            if (seeking) {
                const clientX = getClientX(e);
                if (progressRef.current && clientX !== null) {
                    const clientX = (e as MouseEvent).clientX ? (e as MouseEvent).clientX : (e as TouchEvent).touches[0].clientX;
                    const ele = progressRef.current;
                    const rect = ele.getBoundingClientRect();
                    const frac = (clientX - rect.left) / (rect.width);
                    Player.seek(frac * track.duration);
                }
                setSeeking(false);
            }
        };

        if (seeking) {
            eventsBound.current = true;
            document.addEventListener('mousemove', onSeek);
            document.addEventListener('touchmove', onSeek);
            document.addEventListener('mouseup', onEndSeeking);
            document.addEventListener('touchend', onEndSeeking);
            document.addEventListener('touchcancel', onEndSeeking);
        } else {
            document.removeEventListener('mousemove', onSeek);
            document.removeEventListener('touchmove', onSeek);
            document.removeEventListener('mouseup', onEndSeeking);
            document.removeEventListener('touchend', onEndSeeking);
            document.removeEventListener('touchcancel', onEndSeeking);
            eventsBound.current = false;
        }

        return () => {
            if (eventsBound.current) {
                document.removeEventListener('mousemove', onSeek);
                document.removeEventListener('touchmove', onSeek);
                document.removeEventListener('mouseup', onEndSeeking);
                document.removeEventListener('touchend', onEndSeeking);
                document.removeEventListener('touchcancel', onEndSeeking);
                eventsBound.current = false;
            }
        };
    }, [seeking, progressRef.current]);
    
    if (!Player.currentTrack) return null;

    const track = Player.currentTrack;
    const percent = (Player.playOffset / track.duration) * 100;

    const extraStyle: React.CSSProperties = {};
    if (isMobile()) {
        if (!navigator.userAgent.toLowerCase().includes('android')) {
            extraStyle.minHeight = '10em';
            extraStyle.maxHeight = '10em';
        }
    }

    const Progress = seeking ? PlayerProgressBarInner : PlayerProgressBarInnerAnimated;
    lastPercent.current = percent;

    const onStartSeeking = (e: React.TouchEvent<HTMLDivElement> & React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const clientX = getClientX(e);
        if (clientX !== null) {
            const ele = e.target as HTMLDivElement;
            const rect = ele.getBoundingClientRect();
            const frac = (clientX - rect.left) / (rect.width);
            Player.seek(frac * track.duration);
        }
        setSeeking(true);
    };

    return (
        <PlayerDiv style={extraStyle}>
            <Row>
                <PlayerCoverArt src={coverArtUrl(track.cover_art_id, true)}/>
                <PlayerRightPane>
                    <PlayerTrackInfo>
                        <PlayerTrackInfoDate>{showDate(track)}</PlayerTrackInfoDate>
                        <PlayerTrackInfoTitle>{track.title}</PlayerTrackInfoTitle>
                        <PlayerTrackInfoLine>{track.venue ? track.venue : showLocation(track)}</PlayerTrackInfoLine>
                        <PlayerTrackInfoLine>{track.venue ? showLocation(track) : ''}</PlayerTrackInfoLine>
                    </PlayerTrackInfo>
                    <div style={{ flexGrow: 1 }}/>
                    <PlayerProgress>
                        <VAlignCenter>
                            <PlayerProgressTime>{formatDuration(Player.playOffset)}</PlayerProgressTime>
                        </VAlignCenter>
                        <VAlignCenter style={{ flexGrow: 1 }}>
                            <PlayerProgressBarOuter
                                ref={r => { if (r) progressRef.current = r; }}
                                onTouchStart={onStartSeeking}
                                onMouseDown={onStartSeeking}
                            >
                                <Progress style={{ width: `${percent}%`}}/>
                            </PlayerProgressBarOuter>
                        </VAlignCenter>
                        <VAlignCenter>
                            <PlayerProgressTime>{formatDuration(track.duration - Player.playOffset)}</PlayerProgressTime>
                        </VAlignCenter>
                    </PlayerProgress>
                </PlayerRightPane>
            </Row>
            <PlayerControls>
                <ControlButton
                    onClick={Player.previous}
                    style={{
                        opacity: Player.queueIndex === 0 ? 0.2 : 1.0,
                        pointerEvents: Player.queueIndex === 0 ? 'none' : 'all'
                    }}
                >
                    <svg height="1em" fillRule="evenodd" clipRule="evenodd" fill='currentColor' viewBox='0,0,24,24'>
                        <path d="M23 24l-18-12 18-12v24zm-19-24v24h-1v-24h1zm2.803 12l15.197 10.132v-20.263l-15.197 10.131z"/>
                    </svg>
                </ControlButton>
                <ControlButton onClick={Player.playing ? Player.pause : Player.play}>
                    {Player.playing ? (
                        <svg height="1em" fillRule="evenodd" clipRule="evenodd" fill='currentColor' viewBox='0,0,24,24'>
                            <path d="M10 24h-6v-24h6v24zm10 0h-6v-24h6v24zm-11-23h-4v22h4v-22zm10 0h-4v22h4v-22z"/>
                        </svg>
                    ) : (
                        <svg height="1em" fillRule="evenodd" clipRule="evenodd" fill='currentColor' viewBox='0,0,24,24'>
                            <path d="M26 12l-22 12v-24l22 12zm-21 10.315l18.912-10.315-18.912-10.315v20.63z"/>
                        </svg>
                    )}
                </ControlButton>
                <ControlButton onClick={Player.stop}>
                    <svg height="1em" fillRule="evenodd" clipRule="evenodd" fill='currentColor' viewBox='0,0,24,24'>
                        <path d="M22 2v20h-20v-20h20zm1-1h-22v22h22v-20z"></path>
                    </svg>
                </ControlButton>
                <ControlButton
                    onClick={Player.next}
                    style={{
                        opacity: Player.queueIndex === Player.queue.length - 1 ? 0.2 : 1.0,
                        pointerEvents: Player.queueIndex === Player.queue.length - 1 ? 'none' : 'all'
                    }}
                >
                    <svg height="1em" fillRule="evenodd" clipRule="evenodd" fill='currentColor' viewBox='0,0,24,24'>
                        <path d="M1 24l18-12-18-12v24zm19-24v24h1v-24h-1zm-2.803 12l-15.197 10.132v-20.263l15.197 10.131z"/>
                    </svg>
                </ControlButton>
            </PlayerControls>
        </PlayerDiv>
    );
};

export default PlayerInterface;