import * as React from 'react';
import { Page, ShowListItem, InfiniteScroll, Navigator, PlayerInterface, FilterDialog } from '@components';
import styled from 'styled-components';
import API from '@api';
import { useHistory } from 'react-router-dom';

const ShowList = styled.div`
    display: flex;
    flex-flow: column;
`;
const NoShowsContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;
const NoShows = styled.span`
    text-align: center;
    color: #959595;
    font-size: 1.5em;
    font-family: monospace;
`;

const HomePage : React.FC = () => {
    const { loadMore, shows, loading, totalCount, setFilters, listScroll, setScroll, filters } = API.Shows.use();
    const history = useHistory();

    React.useEffect(() => {
        if (shows.length === 0) {
            const search = location.search.substr(1);
            if (search.length > 0) {
                const paramArr = search.split('&').map(p => p.split('='));
                const params: any = {};
                paramArr.forEach(a => {
                    if (a.length === 2) params[a[0]] = decodeURIComponent(a[1]);
                });
                setFilters(params);
            } else {
                loadMore();
            }
        }
    }, []);
    
    if (shows.length === 0) {
        return (
            <Page
                style={{ display: 'flex', flexDirection: 'column' }}
                noMargin
                noRootContextMenu
            >
                <Navigator/>
                <FilterDialog
                    onSearchChanged={search => { setFilters({ search }); }}
                    search={filters.search}
                />
                <NoShowsContainer>
                    <NoShows>Nope. Sorry. Nothin'</NoShows>
                </NoShowsContainer>
                <PlayerInterface/>
            </Page>
        );
    }

    return (
        <Page noMargin noRootContextMenu flex='column'>
            <Navigator/>
            <FilterDialog
                onSearchChanged={search => { setFilters({ search }); }}
                search={filters.search}
            />
            <InfiniteScroll
                pageStart={0}
                loadMore={() => loadMore()}
                hasMore={shows.length < totalCount}
                threshold={2000}
                loading={loading}
                initialScroll={listScroll}
                onScroll={e => {
                    const ele = e.target as HTMLElement;
                    setScroll(ele.scrollTop);
                }}
                loader={(
                    <div key={0}></div>
                )}
                style={{ flexGrow: 1 }}
            >
                <ShowList>
                    {shows.map(s => (
                        <ShowListItem
                            key={s.id}
                            show={s}
                            viewDetails={() => { history.push(`/shows/${s.id}`)}}
                        />
                    ))}
                </ShowList>
            </InfiniteScroll>
            <PlayerInterface/>
        </Page>
    );
};

export default HomePage;