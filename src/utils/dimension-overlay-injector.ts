// Helper to inject dimension overlay code into popup windows

export async function injectDimensionOverlay(tabId: number) {
  try {
    // Wait a bit for the page to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Inject the dimension overlay script into the main world
    await chrome.scripting.executeScript({
      target: { tabId },
      func: dimensionOverlayScript,
      world: "MAIN" as chrome.scripting.ExecutionWorld,
    });

    // Inject message relay script into the isolated world (default)
    // This world has access to chrome APIs
    await chrome.scripting.executeScript({
      target: { tabId },
      func: messageRelayScript,
      world: "ISOLATED" as chrome.scripting.ExecutionWorld,
    });
  } catch (error) {
    console.error("Failed to inject dimension overlay:", error);
  }
}

// Content script to relay messages from page to background
// This runs in the ISOLATED world and has access to chrome APIs
function messageRelayScript() {
  // Listen for messages from the page
  window.addEventListener("message", async (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;

    if (event.data.type === "RESIZE_TO_PRESET") {
      // Forward the message to the background script
      (chrome as typeof chrome).runtime
        .sendMessage({
          type: "RESIZE_TO_PRESET",
          presetIndex: event.data.presetIndex,
        })
        .catch((err: Error) => {
          console.error("Failed to send message to background:", err);
        });
    } else if (event.data.type === "GET_SETTINGS") {
      // Handle settings request from main world
      try {
        const result = await (chrome as typeof chrome).storage.sync.get("settings");
        const settings: any = result.settings || {};

        // Send settings back to main world
        window.postMessage(
          {
            type: "SETTINGS_RESPONSE",
            requestId: event.data.requestId,
            settings: settings,
          },
          "*",
        );
      } catch (err) {
        console.error("Failed to get settings:", err);
        window.postMessage(
          {
            type: "SETTINGS_RESPONSE",
            requestId: event.data.requestId,
            settings: {},
          },
          "*",
        );
      }
    }
  });
}

// This function will be stringified and injected into the page
function dimensionOverlayScript() {
  let overlayElement: HTMLDivElement | null = null;
  let hideTimeout: number | null = null;
  let currentPresetName: string | null = null;

  // Request settings from the content script (which has chrome API access)
  let settingsCache: any = null;
  let pendingSettingsRequests: Map<
    string,
    { resolve: Function; reject: Function }
  > = new Map();

  // Listen for settings responses from content script
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type === "SETTINGS_RESPONSE") {
      const requestId = event.data.requestId;
      const pending = pendingSettingsRequests.get(requestId);
      if (pending) {
        settingsCache = event.data.settings;
        pending.resolve(event.data.settings);
        pendingSettingsRequests.delete(requestId);
      }
    }
  });

  async function getSettings(): Promise<any> {
    if (settingsCache) return settingsCache;

    return new Promise((resolve, reject) => {
      const requestId = `settings_${Date.now()}_${Math.random()}`;
      pendingSettingsRequests.set(requestId, { resolve, reject });

      // Request settings from content script
      window.postMessage(
        {
          type: "GET_SETTINGS",
          requestId: requestId,
        },
        "*",
      );

      // Timeout after 1 second
      setTimeout(() => {
        if (pendingSettingsRequests.has(requestId)) {
          pendingSettingsRequests.delete(requestId);
          resolve({});
        }
      }, 1000);
    });
  }

  async function getSetting(key: string): Promise<any> {
    try {
      const settings = await getSettings();
      return (
        settings[key] || (key === "dimensionOverlayTimeout" ? 500 : undefined)
      );
    } catch (e) {
      return key === "dimensionOverlayTimeout" ? 500 : undefined;
    }
  }

  function createOverlay(): HTMLDivElement {
    const overlay = document.createElement("div");
    overlay.id = "quick-viewport-dimension-overlay";

    // Styles for the overlay
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 24px 40px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 32px;
      font-weight: 600;
      z-index: 2147483647;
      pointer-events: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      letter-spacing: 0.5px;
      text-align: center;
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function updateOverlayContent() {
    if (!overlayElement) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Clear existing content
    overlayElement.innerHTML = "";

    // Create dimensions text
    const dimensionsDiv = document.createElement("div");
    dimensionsDiv.textContent = `${width} × ${height}`;
    overlayElement.appendChild(dimensionsDiv);

    // Add preset name if available
    if (currentPresetName) {
      const presetDiv = document.createElement("div");
      presetDiv.textContent = currentPresetName;
      presetDiv.style.cssText = `
        font-size: 16px;
        font-weight: 500;
        margin-top: 8px;
        opacity: 0.85;
      `;
      overlayElement.appendChild(presetDiv);
    }
  }

  async function showOverlay() {
    if (!overlayElement) {
      overlayElement = createOverlay();
    }

    updateOverlayContent();

    // Trigger reflow to ensure transition works
    overlayElement.offsetHeight;
    overlayElement.style.opacity = "1";

    // Clear any existing timeout
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
    }

    // Get the configured timeout and hide the overlay
    const timeout = await getSetting("dimensionOverlayTimeout");
    hideTimeout = window.setTimeout(() => {
      if (overlayElement) {
        overlayElement.style.opacity = "0";
      }
    }, timeout);
  }

  // Resize window to specific dimensions via message passing
  async function resizeToPreset(presetIndex: number) {
    try {
      // Get preset info from storage first
      const settings = await getSettings();
      const presets = settings.windowPresets || [];

      if (presetIndex >= 0 && presetIndex < presets.length) {
        const preset = presets[presetIndex];
        currentPresetName = preset.name;
        showOverlay();

        // Send message to background script to handle the resize
        window.postMessage(
          {
            type: "RESIZE_TO_PRESET",
            presetIndex: presetIndex,
          },
          "*",
        );
      }
    } catch (error) {
      console.error("Failed to send resize message:", error);
    }
  }

  // Initialize dimension overlay
  function init() {
    let resizeTimeout: number | null = null;
    let lastPresetTime = 0;

    window.addEventListener("resize", () => {
      // Clear the existing timeout
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }

      // Clear preset name if this is a manual resize (more than 500ms since last preset activation)
      const timeSincePreset = Date.now() - lastPresetTime;
      if (timeSincePreset > 500) {
        currentPresetName = null;
      }

      // Show the overlay immediately
      showOverlay();

      resizeTimeout = window.setTimeout(() => {
        updateOverlayContent();
      }, 50);
    });

    // Listen for Cmd+Number keyboard shortcuts to resize to presets
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux) + number keys (1-9)
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const presetIndex = parseInt(e.key) - 1;
        lastPresetTime = Date.now();
        resizeToPreset(presetIndex);
      }
    });

    // Show initial dimensions
    showOverlay();
  }

  init();
}
