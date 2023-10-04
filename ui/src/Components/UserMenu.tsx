import React from 'react';
import { IContextualMenuProps, Persona, PersonaSize, PrimaryButton, useTheme } from '@fluentui/react';
import { useAccount, useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FunctionComponent = () => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const navigate = useNavigate();
    const theme = useTheme();

    const menuProps: IContextualMenuProps = {
        shouldFocusOnMount: true,
        directionalHint: 6, // bottom right edge
        items: [
            {
                key: 'logout',
                text: 'Logout',
                iconProps: { iconName: 'SignOut' },
                onClick: () => {
                    instance.logout(); // will use MSAL to logout and redirect to the /logout page
                }
            },
            {
                key: 'profile',
                text: 'Profile',
                iconProps: { iconName: 'Contact' },
                onClick: () => {
                    navigate('/me');
                }
            }
        ]
    };

    return (
        <div className='da-user-menu'>
            <PrimaryButton menuProps={menuProps} style={{ background: 'none', border: 'none', padding: '20px 20px', color:'#fff' }}>
                <Persona
                    text={account?.name}
                    size={PersonaSize.size32}
                    imageAlt={account?.name}
                    styles={{primaryText: {color: theme.palette.white, selectors: {':hover': {color: theme.palette.white}}}}}
                />
            </PrimaryButton>

        </div>
    );
};


