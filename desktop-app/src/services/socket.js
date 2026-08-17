/**
 * ============================================================================
 * @file        src/services/socket.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Client Network Service
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Establishes WebSocket client connection to the SyncBridge 
 *              routing server with explicit automatic reconnection profiles.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { io } from "socket.io-client";

// Global WebSocket connection initialization
const socket = io( "http://10.96.56.172:3000", {
    reconnection: true
} );

export default socket;