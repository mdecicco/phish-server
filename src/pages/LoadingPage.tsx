import * as React from 'react';
import { Page, Spinner } from '@components';
import styled from 'styled-components';

type ErrorPageProps = {
    children?: React.ReactNode,
    message?: string,
};

const Message = styled.span`
    text-align: center;
    color: white;
    font-size: 20px;
    font-family: monospace;
    opacity: 0.5;
`;

const IconContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
`;

const LoadingPage : React.FC<ErrorPageProps> = ({ children, message }) => {
    return (
        <Page>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center' }}>
                <IconContainer>
                    <Spinner size={64}/>
                </IconContainer>
                {message && (<Message>{message}</Message>)}
                {children}
            </div>
        </Page>
    );
};

export default LoadingPage;