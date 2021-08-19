import React, { useEffect } from "react";

export type ContextMenuItem = {
    label: string,
    tip?: string,
    disabled?: boolean,
    onClick: () => void
};

export type ContextMenuProps = {
    children: React.ReactElement,
    menuId: string,
    items: ContextMenuItem[],
    disabled?: boolean,
    wrapContent?: boolean,
    wrapperStyle?: React.CSSProperties
};

const ContextMenu : React.FC<ContextMenuProps> = (props: ContextMenuProps) => {
    const ref = React.useRef<HTMLElement>(null);

    const menuIdRef = React.useRef<string | null>(props.menuId);

    useEffect(() => {
        if (menuIdRef.current !== props.menuId) {
            // Menu id changed for some reason... Context menu data must be updated if it
            // contains data for the previous id
            const ctxData = window.contextMenuData.find(d => d.id === menuIdRef.current);
            if (ctxData) ctxData.id = props.menuId;
        }
        menuIdRef.current = props.menuId;

        const ctxData = window.contextMenuData.find(d => d.id === props.menuId);
        if (ctxData) ctxData.items = props.items;
        else window.contextMenuData.push({ id: props.menuId, items: props.items });
        
        window.contextMenuTriggerUpdate();

        return () => {
            window.contextMenuData = window.contextMenuData.filter(d => d.id !== props.menuId);
        };
    }, [props.items, props.menuId]);

    if (props.disabled) return props.children;

    if (!React.isValidElement(props.children)) {
        console.error(`Invalid child provided to ContextMenu component`, props.children);
        return props.children;
    }

    if (React.Children.count(props.children) !== 1) {
        console.error(`The ContextMenu component can only accept one child`, props.children);
        return props.children;
    }

    if ((typeof props.children.type) !== 'string' && !props.children.type.hasOwnProperty('styledComponentId') && !props.wrapContent) {
        console.error(`Only HTML elements and styled components can be wrapped with the ContextMenu component, got`, props.children.type);
        console.error('If you must wrap a non-intrinsic component with the ContextMenu component, pass the wrapContent property');
        return props.children;
    }

    const child = props.wrapContent ? props.children : React.Children.map<React.ReactNode, React.ReactNode>(props.children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                ref,
                'data-context-menu-id': props.menuId
            });
        }
    });
    
    return (
        <React.Fragment>
            {props.wrapContent ? (
                <div ref={ref as React.LegacyRef<HTMLDivElement>} data-context-menu-id={props.menuId} style={props.wrapperStyle}>{child}</div>
            ) : child}
        </React.Fragment>
    );
};

export default ContextMenu;