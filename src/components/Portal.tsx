import * as React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
    onExternalClick?: (e: MouseEvent) => void,
    children?: React.ReactNode,
    style?: React.CSSProperties,
    id: string
};

/**
 * Creates DOM element to be used as React root.
 * @returns {HTMLElement}
 */
function createRootElement(id: string): HTMLDivElement {
    const rootContainer = document.createElement('div');
    rootContainer.setAttribute('id', id);
    return rootContainer;
}
  
/**
 * Appends element as last child of body.
 * @param {HTMLElement} rootElem 
 */
function addRootElement(rootElem: HTMLDivElement): void {
    const target = document.getElementById('page') || document.body;
    const lastElem = target.lastElementChild;
    if (!lastElem) return;
    target.insertBefore(
        rootElem,
        lastElem.nextElementSibling,
    );
}
  
/**
 * Hook to create a React Portal.
 * Automatically handles creating and tearing-down the root elements (no SRR
 * makes this trivial), so there is no need to ensure the parent target already
 * exists.
 * @example
 * const target = usePortal(id, [id]);
 * return createPortal(children, target);
 * @param {String} id The id of the target container, e.g 'modal' or 'spotlight'
 * @returns {HTMLElement} The DOM node to use as the Portal target.
 */
function usePortal(id: string) {
    const rootElemRef = React.useRef<HTMLDivElement | null>(null);
  
    React.useEffect(function setupElement() {
        // Look for existing target dom element to append to
        const existingParent = document.querySelector<HTMLDivElement>(`#${id}`);
        // Parent is either a new root or the existing dom element
        const parentElem = existingParent || createRootElement(id);

        // If there is no existing DOM element, add a new one.
        if (!existingParent) addRootElement(parentElem);

        // Add the detached element to the parent
        if (rootElemRef.current) parentElem.appendChild<HTMLDivElement>(rootElemRef.current);

        return function removeElement() {
            if (!rootElemRef.current) return;
            rootElemRef.current.remove();
            if (!parentElem.childElementCount) parentElem.remove();
        };
    }, [id]);
  
    /**
     * It's important we evaluate this lazily:
     * - We need first render to contain the DOM element, so it shouldn't happen
     *   in useEffect. We would normally put this in the constructor().
     * - We can't do 'const rootElemRef = useRef(document.createElement('div))',
     *   since this will run every single render (that's a lot).
     * - We want the ref to consistently point to the same DOM element and only
     *   ever run once.
     * @link https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
     */
    function getRootElem() {
        if (!rootElemRef.current) {
            rootElemRef.current = document.createElement('div');
        }
        return rootElemRef.current;
    }
  
    return getRootElem();
}

const Portal: React.FC<PortalProps> = (props: PortalProps) => {
    const target = usePortal(props.id);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!ref.current) return;
        const inner = ref.current;

        const clickCallback = (e: MouseEvent) => {
            let node: Element | null = e.target as Element;
            while (node !== null) {
                if (node === inner) return;
                node = node.parentNode as Element | null;
            }

            // Click was outside of the portal content
            if (props.onExternalClick) props.onExternalClick(e);
        };
        
        document.addEventListener('click', clickCallback);

        return () => {
            document.removeEventListener('click', clickCallback);
        };
    }, [ref, props]);

    return createPortal(
        <div
            style={Object.assign({}, props.style, {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none'
            })}
        >
            <div ref={ref} style={{ pointerEvents: 'all' }}>
                {props.children}
            </div>
        </div>
    , target);
};

export default Portal;