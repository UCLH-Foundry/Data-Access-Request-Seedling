import { createTheme } from '@fluentui/react';

// Modify the below to change the colour scheme of the app...
// See https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/theme-slots
export const appTheme = createTheme({
    components: {
        PrimaryButton: {
            styles: {
                root: {
                    backgroundColor: '#00aB8e',
                    color: '#ffffff',
                    borderColor: '#00aB8e',
                    selectors: {
                        ':hover': {
                            backgroundColor: '#212b58',
                            color: '#ffffff',
                        },
                        ':active': {
                            backgroundColor: '#212b58',
                            color: '#ffffff',
                        },
                    },
                },
            },
        },
    },
    palette: {
        themePrimary: '#212b58',
        themeLighterAlt: '#f2fcfa',
        themeLighter: '#cbf2eb',
        themeLight: '#a1e6da',
        themeTertiary: '#52cdb8',
        themeSecondary: '#16b59a',
        themeDarkAlt: '#009a80',
        themeDark: '#00826c',
        themeDarker: '#006050',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#a19f9d',
        neutralSecondary: '#605e5c',
        neutralSecondaryAlt: '#8a8886',
        neutralPrimaryAlt: '#3b3a39',
        neutralPrimary: '#323130',
        neutralDark: '#201f1e',
        black: '#000000',
        white: '#ffffff',
    }
});
