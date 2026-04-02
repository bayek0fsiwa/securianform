/**
 * Centralized timeout constants used across the test framework.
 */

/** Short timeout for quick value verification checks (ms) */
export const TIMEOUT_SHORT = 3000;

/** Medium timeout for standard element waits and condition checks (ms) */
export const TIMEOUT_MEDIUM = 5000;

/** Long timeout for heavy operations like modal transitions and result rendering (ms) */
export const TIMEOUT_LONG = 10000;

/** Default polling interval for waitUntil conditions (ms) */
export const POLL_INTERVAL = 500;
