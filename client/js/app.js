import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import update from 'immutability-helper';
import InfiniteScroll from 'react-infinite-scroll-component';


import './app.scss';
import * as Request from './utils/request';

const pluralize = (unit, count) => {
    return `${count} ${unit}${count === 0 || count > 1 ? 's' : ''}`;
};

const durationToStr = (durationInSeconds, short) => {
    let duration = durationInSeconds;
    let hours = Math.floor(duration / 60 / 60);
    duration -= hours * 60 * 60;
    let minutes = Math.floor(duration / 60);
    duration -= minutes * 60;
    let seconds = Math.floor(duration);
    
    if (!short) {
        duration = `${pluralize('second', seconds)}`;
        if (minutes > 0) duration = `${pluralize('minute', minutes)}, ${duration}`;
        if (hours > 0) duration = `${pluralize('hour', hours)}, ${duration}`;
        return duration;
    } else {
        seconds = `${seconds}`;
        if (seconds.length < 2) seconds = `0${seconds}`;
        
        minutes = `${minutes}`;
        if (minutes.length < 2 && hours > 0) minutes = `0${minutes}`;
        
        if (hours > 0) return `${hours}:${minutes}:${seconds}`;
        else return `${minutes}:${seconds}`;
    }
    
    return null;
};

class ShowDetails extends Component {
    constructor (props) {
        super(props);
        
        this.state = {
            selectedVariationIdx: 0
        };
    }
    
    render () {
        const { visible, show, variations } = this.props;
        const { selectedVariationIdx } = this.state;
        
        if (!show) return null;
        if (!visible) return (<div className='show-details-pane'/>);
        
        let d = '??/??/??';
        if (show.date) {
            const dcomps = show.date.split('/');
            if (dcomps.length === 3) {
                if (dcomps[0].length === 1) dcomps[0] = `0${dcomps[0]}`;
                if (dcomps[1].length === 1) dcomps[1] = `0${dcomps[1]}`;
                d = `${dcomps[0]}/${dcomps[1]}/${dcomps[2]}`;
            }
        }
        
        let location = '';
        if (show.city && show.city !== '---') location = show.city;
        if (show.state && show.state !== '---') {
            if (location.length > 0) location += ', ';
            location += show.state;
        }
        
        const variation = variations[selectedVariationIdx];
        const tracks = show.tracks[show.links[selectedVariationIdx].id];
        const directLinks = show.links.filter(l => !l.is_folder);
        
        return (
            <div className='show-details-pane show-details-pane--open'>
                <div className='details-header'>
                    <img className='details-header__cover' src={`/api/cover/${show.cover_art_id}`}/>
                    <div className='details-header__right'>
                        <div className='details-header__date'>{d}</div>
                        <div className='details-header__location'>{location}</div>
                        <div className='details-header__venue'>{show.venue || ''}</div>
                        <div className='details-header__space'></div>
                        {directLinks.length == 1 && (
                            <a className='details-header__download' href={show.link_url}>Download</a>
                        )}
                    </div>
                </div>
                {directLinks.length > 1 && (
                    <div className='details-variations'>
                        {directLinks.map((l, idx) => {
                            return (
                                <div
                                    key={l.id}
                                    className={`details-variations__variation ${idx === selectedVariationIdx ? 'details-variations__variation--selected' : ''}`}
                                >
                                    {`Variation ${idx + 1}`}
                                </div>
                            );
                        })}
                        <div className='details-variations__space'></div>
                        <a className='details-variations__download' href={directLinks[selectedVariationIdx].url}>{`Download Variation ${selectedVariationIdx + 1}`}</a>
                    </div>
                )}
                <div className='details-tracks'>
                    {tracks.map(t => {
                        return (
                            <div className='track' key={t.id}>
                                <div className='track__title'>{t.title}</div>
                                <div className='track__end'>
                                    <div className='track__duration'>{durationToStr(t.duration, true)}</div>
                                    <a className='track__play' href={`/api/track/${t.id}/stream`} target='_blank'>Play</a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
};

class App extends Component {
    constructor (props) {
        super(props);
        
        this.state = {
            loadingIdx: 1,
            shows: [],
            showVariations: {},
            visibleShows: [],
            selectedShow: null,
            showingSelected: false
        };
        
        Request.get('/api/shows').then(data => {
            if (data.error) {
                this.setState(update(this.state, {
                    loadingIdx: { $set: this.state.loadingIdx - 1 },
                }));
                console.log(data.error);
            } else {
                const groupedShows = [];
                const showVariations = {};
                
                data.shows.forEach(s => {
                    if (groupedShows.find(g => g.id === s.id)) {
                        showVariations[s.id].push(s);
                    } else {
                        groupedShows.push(s);
                        showVariations[s.id] = [s];
                    }
                });
                
                this.setState(update(this.state, {
                    loadingIdx: { $set: this.state.loadingIdx - 1 },
                    shows: { $set: groupedShows },
                    visibleShows: { $set: groupedShows.slice(0, 60) },
                    showVariations: { $set: showVariations }
                }));
            }
        }).catch(err => {
            this.setState(update(this.state, {
                loadingIdx: { $set: this.state.loadingIdx - 1 },
            }));
            console.log(err);
        });
    }
    
    moreShowsAvailable () {
        return this.state.visibleShows.length < this.state.shows.length;
    }
    
    makeNextShowsVisible () {
        if (!this.moreShowsAvailable()) return;
        const startAt = this.state.visibleShows.length;
        this.setState(update(this.state, {
            visibleShows: { $push: this.state.shows.slice(startAt, startAt + 20)}
        }));
    }
    
    selectShow (show) {
        Request.get(`/api/show/${show.id}`).then(s => {
            const changes = {
                showingSelected: { $set: s.show ? true : false }
            };
            if (s.show) changes.selectedShow = { $set: s.show };
            this.setState(update(this.state, changes));
        }).catch(console.error);
    }
    
    render () {
        const { shows, visibleShows, selectedShow, showingSelected, showVariations } = this.state;
        return (
            <div>
                <InfiniteScroll
                    dataLength={visibleShows.length}
                    next={this.makeNextShowsVisible.bind(this)}
                    hasMore={this.moreShowsAvailable.bind(this)}
                    className='show-list'
                >
                    {visibleShows.map(s => {
                        let d = '??/??/??';
                        if (s.date) {
                            const dcomps = s.date.split('/');
                            if (dcomps.length === 3) {
                                if (dcomps[0].length === 1) dcomps[0] = `0${dcomps[0]}`;
                                if (dcomps[1].length === 1) dcomps[1] = `0${dcomps[1]}`;
                                d = `${dcomps[0]}/${dcomps[1]}/${dcomps[2]}`;
                            }
                        }
                        
                        let location = '';
                        if (s.city && s.city !== '---') location = s.city;
                        if (s.state && s.state !== '---') {
                            if (location.length > 0) location += ', ';
                            location += s.state;
                        }
                        
                        return (
                            <div key={s.link_id} className='show'>
                                <img className='show__cover' src={`/api/cover/${s.cover_art_id}`}/>
                                <div className='show-info'>
                                    <div className='show-info__inner' onClick={() => { this.selectShow(s); }}>
                                        <div className='show-info__date'>{d}</div>
                                        <div className='show-info__location'>{location}</div>
                                        <div className='show-info__space'></div>
                                        <div className='show-info__venue'>{s.venue || ''}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </InfiniteScroll>
                <ShowDetails
                    visible={showingSelected}
                    show={selectedShow}
                    variations={selectedShow ? showVariations[selectedShow.id] : null}
                />
            </div>
        );
    }
}

window.addEventListener('load', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    ReactDOM.render(<App />, root);
});
