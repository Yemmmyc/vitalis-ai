import { IVitalisService } from './IVitalisService';
import { HttpVitalisService } from './HttpVitalisService';
import { InAppVitalisService } from './InAppVitalisService';

export class VitalisServiceFactory {
  private static instance: IVitalisService | null = null;
  private static forceMobile: boolean = false;

  public static setForceMobileMode(force: boolean) {
    VitalisServiceFactory.forceMobile = force;
    VitalisServiceFactory.instance = null; // Reset singleton to recreate
  }

  public static getService(): IVitalisService {
    if (!VitalisServiceFactory.instance) {
      if (VitalisServiceFactory.isMobileMode()) {
        console.log('[VitalisServiceFactory] Initializing InAppVitalisService (Standalone Mobile/Offline Mode)');
        VitalisServiceFactory.instance = new InAppVitalisService();
      } else {
        console.log('[VitalisServiceFactory] Initializing HttpVitalisService (Desktop Web/Express Mode)');
        VitalisServiceFactory.instance = new HttpVitalisService();
      }
    }
    return VitalisServiceFactory.instance;
  }

  public static isMobileMode(): boolean {
    if (VitalisServiceFactory.forceMobile) {
      return true;
    }
    if (typeof window !== 'undefined') {
      // 1. Capacitor native platform detection
      if ((window as any).Capacitor?.isNativePlatform?.()) {
        return true;
      }
      // 2. Query string or localStorage override for manual testing
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'mobile' || localStorage.getItem('vitalis_mode') === 'mobile') {
        return true;
      }
      // 3. Local file protocol execution (packaged APK assets)
      if (window.location.protocol === 'file:') {
        return true;
      }
    }
    // 4. Vite build environment flag
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_MODE === 'mobile') {
      return true;
    }
    return false;
  }
}
