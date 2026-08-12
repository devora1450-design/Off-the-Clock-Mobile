import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Replace these with your real AdMob unit IDs before publishing
const PRODUCTION_BANNER_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_ANDROID';
const PRODUCTION_BANNER_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_IOS';
const PRODUCTION_INTERSTITIAL_ANDROID = 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_ANDROID';
const PRODUCTION_INTERSTITIAL_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_IOS';

export const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.OS === 'ios'
    ? PRODUCTION_BANNER_IOS
    : PRODUCTION_BANNER_ANDROID;

export const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
    ? PRODUCTION_INTERSTITIAL_IOS
    : PRODUCTION_INTERSTITIAL_ANDROID;
