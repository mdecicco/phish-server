import * as React from 'react';
import ContextMenu from './ContextMenu';
import AlertPresenter from './AlertPresenter';
import ContextMenuPresenter from './ContextMenuPresenter';
import styled from 'styled-components';

type PageProps = {
    children?: JSX.Element | JSX.Element[],
    noRootContextMenu?: boolean,
    style?: React.CSSProperties,
    noMargin?: boolean,
    flex?: 'row' | 'column'
}

const PageDiv = styled.div`
    background-color: #4a4a4a;
    padding: 0.5em;
    width: calc(100% - 1em);
    height: calc(100% - 1em);
    overflow-y: auto;
    overflow-x: hidden;
`;

const PageInner : React.FC<PageProps> = (props: PageProps) => {
    const extraStyle: React.CSSProperties = {};
    if (props.noMargin) {
        extraStyle.padding = 0;
        extraStyle.width = '100%'
        extraStyle.height = '100%';
    }

    if (props.flex) {
        extraStyle.display = 'flex';
        extraStyle.flexDirection = props.flex;
    }

    return (
        <PageDiv id='page' style={Object.assign({}, extraStyle, props.style)}>
            <ContextMenuPresenter/>
            <AlertPresenter/>
            {props.children}
        </PageDiv>
    );
};

const Page : React.FC<PageProps> = (props: PageProps) => {
    if (props.noRootContextMenu) return (<PageInner {...props}/>);
    
    return (
        <ContextMenu
            menuId='ctx-page'
            wrapContent
            wrapperStyle={{ width: '100%', height: '100%' }}
            items={[
                { label: 'Back', onClick: () => window.history.back() }
            ]}
        >
            <PageInner {...props}/>
        </ContextMenu>
    );
}

export default Page;