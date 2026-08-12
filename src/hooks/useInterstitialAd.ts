import { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { INTERSTITIAL_AD_UNIT_ID } from '../constants/ads';

const SHOW_EVERY_N_NAVIGATIONS = 5;

let navigationCount = 0;

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {});
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      ad.load();
    });

    ad.load();
    adRef.current = ad;

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, []);

  const showIfReady = () => {
    navigationCount++;
    if (navigationCount % SHOW_EVERY_N_NAVIGATIONS === 0 && adRef.current?.loaded) {
      adRef.current.show();
    }
  };

  return { showIfReady };
}
