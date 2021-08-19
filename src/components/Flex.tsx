import * as React from 'react';

enum FlexMode {
    Horizontal        = 'row',
    Vertical          = 'column',
    HorizontalReverse = 'row-reverse',
    VerticalReverse   = 'column-reverse'
};

enum FlexSpacing {
    SpaceBetween = 'space-between',
    SpaceAround  = 'space-around'
};

type FlexProps = {
    onClick?: () => void,
    children?: React.ReactNode,
    mode: FlexMode,
    spacing?: FlexSpacing,
    style?: React.CSSProperties
};

class Flex extends React.Component<FlexProps> {
    constructor (props : FlexProps) {
        super(props);
    }

    render () : JSX.Element {
        const style = this.props.style ? this.props.style : {};
        return (
            <div
                onClick={this.props.onClick}
                style={Object.assign({}, style, {
                    display: 'flex',
                    flexDirection: this.props.mode,
                    justifyContent: this.props.spacing ? this.props.spacing : 'normal'
                })}
            >
                {this.props.children}
            </div>
        );
    }

    static Mode = FlexMode;
};

export default Flex;