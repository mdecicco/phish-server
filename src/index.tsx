import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import API, { PlayerType } from '@api';
import { HomePage, QueuePage, ShowDetailsPage, TrackPage } from '@pages';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';
import './reset.css';

declare global {
    interface Window {
        player: PlayerType
    }
};

const store = API.createStore();

window.player = new API.Player.Player(store);

render(
    <Provider store={store}>
        <Router>
            <Route exact path='/'>
                <HomePage/>
            </Route>
            <Route exact path='/shows/:id'>
                <ShowDetailsPage/>
            </Route>
            <Route exact path='/tracks'>
                <TrackPage/>
            </Route>
            <Route exact path='/queue'>
                <QueuePage/>
            </Route>
        </Router>
    </Provider>
    , document.getElementById('root')
);