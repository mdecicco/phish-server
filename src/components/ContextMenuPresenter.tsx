import React from "react";
import styled from 'styled-components';
import { ContextMenuItem } from './ContextMenu';
import Portal from './Portal';

const ContextMenuItemContainer = styled.div`
    padding: 8px;
    transition: background-color 125ms;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

const ContextMenuContainer = styled.div`
    background-color: rgb(41, 42, 45);
    border: 1px solid rgb(60, 64, 67);
    position: absolute;
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    z-index: 9999;
    font-size: 14px;
    color: white;
    font-family: sans-serif;
    box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.32);
`;

const ContextMenuItemSeparator = styled.div`
    border-bottom: 1px solid rgb(60, 64, 67);
    margin: 5px;
`;

declare global {
    interface Window {
        contextMenuData: {
            id: string,
            items: ContextMenuItem[]
        }[];
        contextMenuActiveIds: (string | null)[];
        contextMenuTriggerUpdate: () => void;
    }
};

window.contextMenuData = [];
window.contextMenuActiveIds = [];
window.contextMenuTriggerUpdate = () => { 0; };

const ContextMenuPresenter : React.FC = () => {
    const [visible, setVisible] = React.useState<boolean>(false);
    const [render, setRender] = React.useState<number>(0);
    const [pos, setPos] = React.useState({ x: 0, y: 0});
    const ref = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const showMenu = (e: MouseEvent) => {
            window.contextMenuActiveIds = [];
            let node = e.target as Element | null;

            // follow the node chain upward and accumulate context menu ids
            while (node !== null && node !== document.body as Element) {
                if (node === ref.current) {
                    // if the user right clicked on the context menu (but somehow not on one of the items)
                    // then just close the menu
                    e.preventDefault();
                    setVisible(false);
                    window.contextMenuActiveIds = [];
                    return;
                }

                if (node.hasAttribute('data-context-menu-id')) {
                    // This node has context menu items to add
                    const id = node.getAttribute('data-context-menu-id');
                    window.contextMenuActiveIds.push(id);
                }
                node = node.parentNode as Element | null;
            }

            if (window.contextMenuActiveIds.length === 0) {
                // Client didn't right click on anything with context menu items
                setVisible(false);
                return;
            }
            
            // prevent default browser context menu, set click position and show the menu
            e.preventDefault();
            setPos({ x: e.clientX, y: e.clientY });
            setVisible(true);
        };

        document.addEventListener('contextmenu', showMenu);

        return () => {
            document.removeEventListener('contextmenu', showMenu);
        };
    }, [setVisible, render]);

    // Sort of a hack
    // window.contextMenuTriggerUpdate is used solely by the ContextMenu component
    // and is called only when the contents of window.contextMenuData are changed.
    // This is because the ContextMenuPresenter component needs to be re-rendered
    // when any context menus change.
    //
    // Context menu items need to "bubble" up like events and accumulate
    // as the 'contextmenu' event rises up the chain of elements. Additionally,
    // menu items need function callbacks to be most convenient (ie. update local
    // component states). As far as I can tell, the "proper" way to achieve this
    // behavior would be by using the "Provider" component pattern and use the
    // ContextAPI within react, and implement some custom hooks to interface with
    // the context menu provider. This solution has two main drawbacks in this
    // case:
    // 1. Functions (for menu item click events) can not be stored in the
    //    hypothetical context provider's state and accessed via the ContextAPI
    //    without using another hack anyway, or just passing redux actions which
    //    could be stored in the state and dispatched later, but removes the
    //    ability to do anything useful with local component state.
    // 2. There would be a little bit more code clutter involved in defining
    //    context menus for components, and this would discourage its use a bit.
    //
    // Furthermore, this solution is safe by my estimation. This component will
    // be mounted when the page loads and will not be unmounted until the client
    // navigates away from the page. So window.contextMenuTriggerUpdate will
    // always be a valid function with defined behavior. 
    window.contextMenuTriggerUpdate = () => {
        setRender(render + 1);
    };

    if (!visible) return null;

    // Build list of menu items
    let items: (ContextMenuItem | null)[] = [];
    window.contextMenuActiveIds.forEach(id => {
        const data = window.contextMenuData.find(d => d.id === id);
        if (data) {
            // Put them at the front of the items array and separate from the rest with null.
            // Null items will be rendered as a horizontal line, to separate context items
            // from different elements.
            const newArr: (ContextMenuItem | null)[] = Array.from(data.items);
            if (items.length > 0) {
                newArr.push(null);
                items.forEach(i => newArr.push(i));
            }
            items = newArr;
        }
    });

    // Calculate context menu dimensions
    const size = {
        w: 302, // 300px + 2px border
        h: 2 // 2px border
    };

    items.forEach(i => {
        if (i) size.h += 30;
        else size.h += 11; // 10px margin, 1px border
    });

    // Calculate context menu top-left position (don't allow it to go off screen)
    const posStyle: React.CSSProperties = { top: `${pos.y}px`, left: `${pos.x}.px` };
    if (pos.y + size.h > window.innerHeight) posStyle.top = `${pos.y - size.h}px`;
    if (pos.x + size.w > window.innerWidth) posStyle.left = `${pos.x - size.w}px`;

    return (
        <Portal
            id='context-menu'
            onExternalClick={() => {
                // If the user left clicks outside of the context menu, hide it
                setVisible(false);
            }}
        >
            <ContextMenuContainer ref={ref} style={posStyle}>
                {items.map((i, idx) => 
                    i ? (
                        <ContextMenuItemContainer
                            key={idx}
                            onClick={() => { setVisible(false); i.onClick(); }}
                            onContextMenu={(e) => {
                                // right clicking on a menu item should be the same as left clicking on it
                                e.preventDefault();
                                e.stopPropagation();
                                setVisible(false);
                                i.onClick();
                            }}
                            style={{ pointerEvents: i.disabled ? 'none' : 'all' }}
                        >
                            <span style={{ opacity: i.disabled ? 0.4 : 1.0 }}>{i.label}</span>
                            <span style={{ opacity: 0.4 }}>{i.tip}</span>
                        </ContextMenuItemContainer>
                    ) : (
                        <ContextMenuItemSeparator key={idx}/>
                    )
                )}
            </ContextMenuContainer>
        </Portal>
    );
};

export default ContextMenuPresenter;