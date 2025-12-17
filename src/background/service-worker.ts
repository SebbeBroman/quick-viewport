// Background service worker for handling keyboard shortcuts and commands
import { injectDimensionOverlay } from "@/utils/dimension-overlay-injector";
import { getSettings } from "@/utils/settings";

async function openInViewport(width: number, height: number) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url) return;

  const newWindow = await chrome.windows.create({
    url: tab.url,
    type: "popup",
    width: width,
    height: height,
  });

  // Inject dimension overlay script into the new popup window
  if (newWindow?.tabs?.[0]?.id) {
    injectDimensionOverlay(newWindow.tabs[0].id);
  }
}

async function openInFirstPresetViewport() {
  // Get the first preset from user settings
  const settings = await getSettings();
  const firstPreset = settings.windowPresets[0];

  if (firstPreset) {
    await openInViewport(firstPreset.width, firstPreset.height);
  } else {
    // Fallback to default mobile size if no presets configured
    await openInViewport(375, 667);
  }
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener(() => {
  openInFirstPresetViewport();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'RESIZE_TO_PRESET') {
    handleResizeToPreset(message.presetIndex, sender.tab?.windowId);
  }
});

async function handleResizeToPreset(presetIndex: number, windowId?: number) {
  try {
    const settings = await getSettings();
    const presets = settings.windowPresets || [];
    
    if (presetIndex >= 0 && presetIndex < presets.length) {
      const preset = presets[presetIndex];
      
      // Get the window ID if not provided
      const targetWindowId = windowId || (await chrome.windows.getCurrent()).id;
      
      if (targetWindowId) {
        await chrome.windows.update(targetWindowId, {
          width: preset.width,
          height: preset.height
        });
      }
    }
  } catch (error) {
    console.error('Failed to resize window:', error);
  }
}
