/**
 * ============================================================================
 * @file        src/utils/device.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Utility Engine Service
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Generates or retrieves a unique persistent hardware-level
 * identity footprint using global standard UUID mapping keys.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { v4 as uuidv4 } from "uuid";

// Fetch or allocate persistent client identification tags
export function getDeviceId() {

    let deviceId = localStorage.getItem( "deviceId" );

    if ( !deviceId ) {

        deviceId = "desktop-" + uuidv4();

        localStorage.setItem(
            "deviceId",
            deviceId
        );
    }

    return deviceId;
}