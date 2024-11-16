// src/utils/usernameUtils.ts
export async function buildCreepyUsername() {
    const fingerprint = {
        async getLocationData() {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                return {
                    postal: data.postal,
                    city: data.city?.toLowerCase(),
                    isp: data.org?.split(' ')[0]?.toLowerCase(),
                    lat: data.latitude?.toFixed(1),
                    long: data.longitude?.toFixed(1)
                };
            } catch (e) {
                return null;
            }
        },

        getHardwareInfo() {
            const gpu = (() => {
                try {
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl');
                    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
                    return gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL)
                        ?.split(' ')[0]?.toLowerCase() || null;
                } catch (e) {
                    return null;
                }
            })();

            return {
                gpu,
                cores: navigator.hardwareConcurrency,
                screen: `${window.screen.width}x${window.screen.height}`
            };
        },

        async getBrowserInfo() {
            let isIncognito = false;
            try {
                await navigator.storage.estimate();
                const temp = window.indexedDB.open('test');
                temp.onsuccess = () => temp.result.close();
            } catch (e) {
                isIncognito = true;
            }

            let battery = null;
            if ('getBattery' in navigator) {
                try {
                    const b = await (navigator as any).getBattery();
                    battery = {
                        level: Math.floor(b.level * 100),
                        charging: b.charging
                    };
                } catch (e) {
                    battery = null;
                }
            }

            return {
                battery,
                platform: navigator.platform?.toLowerCase(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                isIncognito,
                isVPN: false
            };
        }
    };

    const [locationData, hardwareInfo, browserInfo] = await Promise.all([
        fingerprint.getLocationData(),
        Promise.resolve(fingerprint.getHardwareInfo()),
        fingerprint.getBrowserInfo()
    ]);

    function constructUsername() {
        const parts: string[] = [];

        if (locationData) {
            if (locationData.postal) {
                parts.push(locationData.postal);
            } else if (locationData.city) {
                parts.push(locationData.city);
            }
        }

        if (hardwareInfo) {
            if (hardwareInfo.gpu) {
                parts.push(hardwareInfo.gpu);
            }
            if (hardwareInfo.cores) {
                parts.push(`${hardwareInfo.cores}core`);
            }
        }

        if (browserInfo?.battery) {
            parts.push(`${browserInfo.battery.level}pct`);
        }

        if (browserInfo?.isIncognito) {
            return `incognito-cant-hide-${parts[0] || 'user'}`;
        }

        if (locationData?.isp?.includes('vpn')) {
            return `vpn-detected-${parts[0] || 'user'}`;
        }

        const baseUsername = parts.slice(0, 3).join('-');
        return baseUsername || 'unknown-user';
    }

    return `${constructUsername()}@noahzoarski.net`;
}