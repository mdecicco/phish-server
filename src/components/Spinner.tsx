import * as React from 'react';
import styled from 'styled-components';

type SpinnerProps = {
    outerColor?: string,
    innerColor?: string,
    outerWidth?: number,
    innerWidth?: number,
    size?: number,
    duration?: number,
    style?: React.CSSProperties
};

const Spinner : React.FC<SpinnerProps> = (props: SpinnerProps) => {
    const outerColor = props.outerColor ? props.outerColor : '#626262';
    const innerColor = props.innerColor ? props.innerColor : '#ff9800';
    const outerWidth = props.outerWidth ? props.outerWidth : 8;
    const innerWidth = props.innerWidth ? props.innerWidth : 5;
    const outerRadius = (props.size ? props.size : 64) * 0.5;
    const radius = outerRadius - (outerWidth * 0.5);
    const duration = props.duration ? props.duration : 4;
    const origin = radius + (outerWidth * 0.5);
    return (
        <svg
            width={`${(radius * 2) + outerWidth}px`}
            height={`${(radius * 2) + outerWidth}px`}
            style={props.style}
            preserveAspectRatio='xMidYMid'
        >
            <circle cx={`${origin}px`} cy={`${origin}px`} r={radius} stroke={outerColor} strokeWidth={outerWidth} fill='none'/>
            <circle cx={`${origin}px`} cy={`${origin}px`} r={radius} stroke={innerColor} strokeWidth={innerWidth} strokeLinecap='round' fill='none'>
                <animateTransform
                    attributeName='transform'
                    type='rotate'
                    repeatCount='indefinite'
                    dur={`${duration}s`}
                    values={`0 ${origin} ${origin};180 ${origin} ${origin};720 ${origin} ${origin}`}
                    keyTimes='0;0.5;1'
                />
                <animate
                    attributeName='stroke-dasharray'
                    repeatCount='indefinite'
                    dur={`${duration}s`}
                    values={`${0.6283185307179586 * radius} ${5.654866776461628 * radius};${3.141592653589793 * radius} ${3.141592653589793 * radius};${0.6283185307179586 * radius} ${5.654866776461628 * radius}`}
                    keyTimes='0;0.5;1'
                />
            </circle>
        </svg>
    );
};

export default Spinner;