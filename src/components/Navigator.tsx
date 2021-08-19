import * as React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

type NavigatorProps = {
}

const NavigatorDiv = styled.div`
    width: 100vw;
    min-height: 3.2em;
    max-height: 3.2em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    line-height: 3em;
`;

const NavigatorInterface : React.FC<NavigatorProps> = (props: NavigatorProps) => {
    return (
        <NavigatorDiv>
            <NavLink
                to='/'
                isActive={(match, location) => {
                    if (!match || location.pathname !== '/') return false;
                    return true;
                }}
            >
                Shows
            </NavLink>
            <NavLink to='/tracks'>Tracks</NavLink>
            <NavLink to='/queue'>Queue</NavLink>
        </NavigatorDiv>
    );
};

export default NavigatorInterface;