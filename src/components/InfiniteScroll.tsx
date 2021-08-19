import * as React from 'react';
import { node } from 'webpack';

type InfiniteScrollProps = {
    children: React.ReactNode,
    element?: string | React.FunctionComponent<any> | React.ComponentClass<any, any>,
    hasMore: boolean,
    initialLoad?: boolean,
    isReverse?: boolean,
    loader: React.ReactNode,
    loading: boolean,
    loadMore: (page?: number) => void,
    pageStart: number,
    threshold: number,
    useCapture?: boolean,
    useWindow?: boolean,
    onScroll?: React.UIEventHandler<HTMLDivElement>,
    initialScroll?: number,
    style?: React.CSSProperties
};

export default class InfiniteScroll extends React.Component<InfiniteScrollProps> {
    pageLoaded: number = 0;
    loadMore: boolean = false;
    beforeScrollHeight: number = 0;
    beforeScrollTop: number = 0;
    scrollComponent: HTMLElement | null = null;
    didSetInitialScroll: boolean;
  
    constructor (props: InfiniteScrollProps) {
        super(props);
        this.didSetInitialScroll = false;
    
        this.scrollListener = this.scrollListener.bind(this);
        this.mousewheelListener = this.mousewheelListener.bind(this);
    }
  
    componentDidMount () {
        this.pageLoaded = this.props.pageStart;
        this.attachScrollListener();
    }
  
    componentDidUpdate () {
        if (this.props.isReverse && this.loadMore) {
            const parentElement = this.getParentElement(this.scrollComponent);
            if (parentElement) parentElement.scrollTop = parentElement.scrollHeight - this.beforeScrollHeight + this.beforeScrollTop;
            this.loadMore = false;
        }
        this.attachScrollListener();
    }
  
    componentWillUnmount () {
        this.detachScrollListener();
        this.detachMousewheelListener();
    }
  
    detachMousewheelListener() {
        if (!this.props.useWindow && this.scrollComponent) {
            const node = this.scrollComponent.parentNode;
            if (node) node.removeEventListener('mousewheel', this.mousewheelListener as EventListener, this.props.useCapture);
        } else {
            window.removeEventListener('mousewheel', this.mousewheelListener as EventListener, this.props.useCapture);
        }
    }
  
    detachScrollListener() {
        if (!this.props.useWindow) {
            const node = this.getParentElement(this.scrollComponent);
            if (node) {
                node.removeEventListener('scroll', this.scrollListener, this.props.useCapture);
                node.removeEventListener('resize', this.scrollListener, this.props.useCapture);
            }
        } else {
            window.removeEventListener('scroll', this.scrollListener, this.props.useCapture);
            window.removeEventListener('resize', this.scrollListener, this.props.useCapture);
        }
    }
  
    getParentElement(el : HTMLElement | null) : HTMLElement | null {
      return (el && el.parentNode) as HTMLElement | null;
    }
  
    attachScrollListener() {
        const parentElement = this.getParentElement(this.scrollComponent);
    
        if (!this.props.hasMore || (!parentElement && !this.props.useWindow)) {
            return;
        }

        if (!this.props.useWindow && parentElement) {
            parentElement.addEventListener('mousewheel', this.mousewheelListener as EventListener, { capture: this.props.useCapture, passive: true });
            parentElement.addEventListener('scroll', this.scrollListener, this.props.useCapture);
            parentElement.addEventListener('resize', this.scrollListener, this.props.useCapture);
        } else if (this.props.useWindow) {
            window.addEventListener('mousewheel', this.mousewheelListener as EventListener, { capture: this.props.useCapture, passive: true });
            window.addEventListener('scroll', this.scrollListener, this.props.useCapture);
            window.addEventListener('resize', this.scrollListener, this.props.useCapture);
        }
    
        if (this.props.initialLoad) {
            this.scrollListener();
        }
    }
  
    mousewheelListener(e: WheelEvent) {
        if (e.deltaY === 1) {
            e.preventDefault();
        }
    }
  
    scrollListener() {
        const el = this.scrollComponent;
        const parentNode = this.getParentElement(el);
        if (!parentNode || !el) return;
    
        let offset;
        if (this.props.useWindow) {
            const doc = document.documentElement || document.body.parentNode || document.body;
            const scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : doc.scrollTop;
            if (this.props.isReverse) offset = scrollTop;
            else offset = this.calculateOffset(el, scrollTop);
        } else if (this.props.isReverse) {
            offset = parentNode.scrollTop;
        } else {
            offset = el.scrollHeight - parentNode.scrollTop - parentNode.clientHeight;
        }
        
        // Here we make sure the element is visible as well as checking the offset
        if (offset < Number(this.props.threshold) && (el && el.offsetParent !== null)) {
            this.detachScrollListener();
            this.beforeScrollHeight = parentNode.scrollHeight;
            this.beforeScrollTop = parentNode.scrollTop;
            // Call loadMore after detachScrollListener to allow for non-async loadMore functions
            if ((typeof this.props.loadMore) === 'function') {
                if (!this.props.loading) this.props.loadMore(this.pageLoaded += 1);
                this.loadMore = true;
            }
        }
    }
  
    calculateOffset(el: HTMLElement, scrollTop: number) : number {
        if (!el) return 0;
        return this.calculateTopPosition(el) + (el.offsetHeight - scrollTop - window.innerHeight);
    }
  
    calculateTopPosition(el: HTMLElement) : number {
        if (!el) return 0;
        return el.offsetTop + this.calculateTopPosition(el.offsetParent as HTMLElement);
    }
  
    render() {
        const {
            children,
            element,
            hasMore,
            initialLoad,
            isReverse,
            loader,
            loadMore,
            pageStart,
            threshold,
            useCapture,
            useWindow,
            loading,
            initialScroll,
            style,
            ...props
        } = this.props;

        const childrenArray = [children];
        if (hasMore) {
            if (loader) {
                isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader);
            }
        }

        return (
            <div
                ref={(n: HTMLDivElement) => {
                    if (!n || this.didSetInitialScroll || !initialScroll) return;
                    this.didSetInitialScroll = true;
                    n.scrollTop = initialScroll;
                }}
                {...props}
                style={Object.assign({}, style, { overflowY: 'auto' })}
            >
                <div
                    ref={(n: HTMLDivElement) => {
                        this.scrollComponent = n;
                    }}
                >
                    {childrenArray}
                </div>
            </div>
        );
    }
};