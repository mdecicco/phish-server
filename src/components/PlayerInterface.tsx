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
    ControlButton,
    ArrowRight,
    ArrowLeft,
    Pause
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
        extraStyle.minHeight = '10em';
        extraStyle.maxHeight = '10em';
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
                <PlayerCoverArt src={coverArtUrl(track.cover_art_id)}/>
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
                    <ArrowLeft style={{ left: '-0.4em', top: '0.25em' }}/>
                    <ArrowLeft style={{ left: '-0.1em', top: '-0.3em' }}/>
                </ControlButton>
                <ControlButton onClick={Player.playing ? Player.pause : Player.play}>
                    {Player.playing ? (
                        <Pause/>
                    ) : (
                        <ArrowRight/>
                    )}
                </ControlButton>
                <ControlButton
                    onClick={Player.next}
                    style={{
                        opacity: Player.queueIndex === Player.queue.length - 1 ? 0.2 : 1.0,
                        pointerEvents: Player.queueIndex === Player.queue.length - 1 ? 'none' : 'all'
                    }}
                >
                    <ArrowRight style={{ left: '-0.4em', top: '0.25em' }}/>
                    <ArrowRight style={{ left: '-0.05em', top: '-0.3em' }}/>
                </ControlButton>
            </PlayerControls>
        </PlayerDiv>
    );
};

export default PlayerInterface;