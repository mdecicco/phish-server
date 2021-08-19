import * as React from 'react';
import { Page } from '@components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components';

type ErrorPageProps = {
    children?: React.ReactNode,
    message?: string,
    icon?: IconDefinition,
    iconColor?: string
};

const Message = styled.span`
    text-align: center;
    color: white;
    font-size: 20px;
    font-family: monospace;
    opacity: 0.5;
`;

const ErrorPage : React.FC<ErrorPageProps> = ({ children, message, icon, iconColor }) => {
    const errIcon = icon ? icon : faExclamationTriangle;
    const color = iconColor ? iconColor : '#c44f4f';
    return (
        <Page>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <FontAwesomeIcon
                        icon={errIcon}
                        color={color}
                        style={{ fontSize: 128, marginBottom: 10 }}
                    />
                </div>
                {message && (<Message>{message}</Message>)}
                {children}
            </div>
        </Page>
    );
};

export default ErrorPage;