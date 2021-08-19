import { ButtonConfirmTimeout } from '@constants';
import * as React from 'react';
import {
    StyledNormalButton,
    StyledPrimaryButton,
    StyledDangerButton,
    StyledPrimaryDangerButton,
    StyledNormalConfirmBox,
    StyledPrimaryConfirmBox,
    StyledDangerConfirmBox,
    StyledPrimaryDangerConfirmBox,
    StyledButtonLabel
} from './styled/Button';

export type ButtonProps = {
    label?: string,
    onClick?: React.MouseEventHandler<HTMLDivElement>,
    disabled?: boolean,
    danger?: boolean,
    primary?: boolean,
    confirm?: boolean,
    confirmText?: string
    buttonStyle?: React.CSSProperties,
    labelStyle?: React.CSSProperties
};

/**
 * A button component with some special features
 * @param danger (boolean) Styles the button to indicate a potentially destructive action. (optional)
 * @param primary (boolean) Styles the button to indicate a primary action. (optional)
 * @param confirm (boolean) Prevents the button from being accidentally clicked by showing a timer after the first click. The button must be clicked again before the timer runs out to fire the action. (optional)
 * @param confirmText (string) The text that the button label changes to when the confirmation timer is active. Defaults to 'Confirm'. (optional)
 * @param buttonStyle (React.CSSProperties) Custom styling attributes to be applied to the button (optional)
 * @param labelStyle (React.CSSProperties) Custom styling attributes to be applied to the button label (optional)
 */
const Button : React.FC<ButtonProps> = props => {
    const [confirmTimeout, setConfirmTimeout] = React.useState<null | NodeJS.Timeout>(null);

    const BtnComp = props.danger ? (props.primary ? StyledPrimaryDangerButton : StyledDangerButton) : (props.primary ? StyledPrimaryButton : StyledNormalButton);
    let onClick = props.onClick;
    if (props.confirm) {
        if (!confirmTimeout) {
            // start confirmation timer and animation
            onClick = () => {
                const timeout = setTimeout(() => {
                    setConfirmTimeout(null);
                }, ButtonConfirmTimeout * 1000.0);
                setConfirmTimeout(timeout);
            };
        } else {
            // button clicked before timer finished, accept input
            onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                clearTimeout(confirmTimeout);
                setConfirmTimeout(null);
                if (props.onClick) props.onClick(event);
            };
        }
    }

    const ConfirmComp = props.danger ? (props.primary ? StyledPrimaryDangerConfirmBox : StyledDangerConfirmBox) : (props.primary ? StyledPrimaryConfirmBox : StyledNormalConfirmBox);

    return (
        <BtnComp
            onClick={onClick}
            disabled={props.disabled ? true : false}
            style={props.buttonStyle}
        >
            <StyledButtonLabel style={props.labelStyle}>
                {confirmTimeout ? (props.confirmText ? props.confirmText : 'Confirm') : (props.label ? props.label : '')}
            </StyledButtonLabel>
            {confirmTimeout && (<ConfirmComp/>)}
        </BtnComp>
    )
};

export default Button;