import { createSignal, onMount, For, Show } from "solid-js";
import {
  getSettings,
  saveSettings,
  WindowPreset,
} from "@/utils/settings";
import { DEVICE_PRESETS } from "@/utils/device-presets";

function App() {
  const [presets, setPresets] = createSignal<WindowPreset[]>([]);
  const [saved, setSaved] = createSignal(false);
  const [editingPreset, setEditingPreset] = createSignal<string | null>(null);
  const [showDialog, setShowDialog] = createSignal(false);
  const [draggedIndex, setDraggedIndex] = createSignal<number | null>(null);

  // Form state for new/edit preset
  const [formName, setFormName] = createSignal("");
  const [formWidth, setFormWidth] = createSignal(393);
  const [formHeight, setFormHeight] = createSignal(852);

  onMount(async () => {
    const settings = await getSettings();
    setPresets(settings.windowPresets);
  });

  const handleSave = async () => {
    await saveSettings({
      windowPresets: presets(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddPreset = async () => {
    const newPreset: WindowPreset = {
      id: `custom-${Date.now()}`,
      name: formName(),
      width: formWidth(),
      height: formHeight(),
    };
    const updatedPresets = [...presets(), newPreset];
    setPresets(updatedPresets);
    await handleSave();
    resetForm();
    setShowDialog(false);
  };

  const handleRemovePreset = async (id: string) => {
    setPresets(presets().filter((p) => p.id !== id));
    await handleSave();
  };

  const handleEditPreset = (preset: WindowPreset) => {
    setEditingPreset(preset.id);
    setFormName(preset.name);
    setFormWidth(preset.width);
    setFormHeight(preset.height);
    setShowDialog(true);
  };

  const handleUpdatePreset = async () => {
    setPresets(
      presets().map((p) =>
        p.id === editingPreset()
          ? { ...p, name: formName(), width: formWidth(), height: formHeight() }
          : p,
      ),
    );
    await handleSave();
    resetForm();
    setEditingPreset(null);
    setShowDialog(false);
  };

  const resetForm = () => {
    setFormName("");
    setFormWidth(393);
    setFormHeight(852);
  };

  const handleDeviceSelect = (e: Event) => {
    const value = (e.currentTarget as HTMLSelectElement).value;
    if (!value) return;

    const device = DEVICE_PRESETS[value];
    if (device) {
      setFormName(device.name);
      setFormWidth(device.width);
      setFormHeight(device.height);
    }

    // Reset the select to show placeholder
    (e.currentTarget as HTMLSelectElement).value = "";
  };

  const cancelEdit = () => {
    setEditingPreset(null);
    setShowDialog(false);
    resetForm();
  };

  const openAddDialog = () => {
    resetForm();
    setEditingPreset(null);
    setShowDialog(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    const draggedIdx = draggedIndex();
    if (draggedIdx !== null && draggedIdx !== index) {
      const items = [...presets()];
      const [removed] = items.splice(draggedIdx, 1);
      items.splice(index, 0, removed);
      setPresets(items);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await handleSave();
  };

  return (
    <div
      style={{
        padding: "24px",
        "font-family":
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        "font-size": "14px",
        "background-color": "#ffffff",
        color: "#000000",
        "min-height": "100vh",
        "max-width": "900px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          "font-size": "24px",
          "font-weight": "600",
          "margin-bottom": "24px",
          color: "#000000",
        }}
      >
        Settings
      </div>
      {/* Window Presets */}
      <div
        style={{
          "margin-bottom": "24px",
          padding: "20px",
          border: "1px solid #e0e0e0",
          "border-radius": "8px",
          "background-color": "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            "margin-bottom": "16px",
          }}
        >
          <h2
            style={{
              "font-size": "16px",
              "font-weight": "600",
              margin: "0",
              color: "#000000",
            }}
          >
            Window Presets
          </h2>
          <button
            onClick={openAddDialog}
            style={{
              padding: "8px 16px",
              "font-size": "13px",
              cursor: "pointer",
              "background-color": "#000000",
              color: "#ffffff",
              border: "none",
              "border-radius": "4px",
              "font-family": "inherit",
              "font-weight": "500",
            }}
          >
            + Add Preset
          </button>
        </div>

        <p
          style={{
            "font-size": "12px",
            color: "#666",
            "margin-top": "0",
            "margin-bottom": "16px",
          }}
        >
          When the preview window is open, use{" "}
          <kbd
            style={{
              padding: "2px 6px",
              "font-size": "11px",
              "background-color": "#f0f0f0",
              border: "1px solid #d0d0d0",
              "border-radius": "3px",
              "font-family": "monospace",
            }}
          >
            Cmd
          </kbd>{" "}
          + number (1-9) to quickly resize to that preset.
        </p>

        {/* Presets List */}
        <div>
          <For each={presets()}>
            {(preset, index) => (
              <div
                draggable={true}
                onDragStart={() => handleDragStart(index())}
                onDragOver={(e) => handleDragOver(e, index())}
                onDragEnd={handleDragEnd}
                style={{
                  padding: "12px 16px",
                  "margin-bottom": "8px",
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  border: "1px solid #e0e0e0",
                  "border-radius": "6px",
                  "background-color":
                    draggedIndex() === index() ? "#f0f7ff" : "white",
                  cursor: "grab",
                  transition: "background-color 0.2s",
                }}
              >
                <div
                  style={{
                    flex: "1",
                    "min-width": "0",
                    display: "flex",
                    "align-items": "center",
                    gap: "12px",
                  }}
                >
                  <Show when={index() < 9}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        "background-color": "#f0f0f0",
                        "border-radius": "4px",
                        "font-size": "12px",
                        "font-weight": "600",
                        color: "#666",
                        "flex-shrink": "0",
                      }}
                    >
                      {index() + 1}
                    </div>
                  </Show>
                  <div style={{ flex: "1", "min-width": "0" }}>
                    <div
                      style={{
                        "font-size": "14px",
                        "font-weight": "500",
                        "margin-bottom": "4px",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          "text-overflow": "ellipsis",
                          "white-space": "nowrap",
                        }}
                      >
                        {preset.name}
                      </span>
                    </div>
                    <div style={{ "font-size": "12px", color: "#666" }}>
                      {preset.width} × {preset.height}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    "align-items": "center",
                    "flex-shrink": "0",
                    "margin-left": "16px",
                  }}
                >
                  <button
                    onClick={() => handleEditPreset(preset)}
                    style={{
                      padding: "6px 12px",
                      "font-size": "12px",
                      cursor: "pointer",
                      "background-color": "white",
                      color: "#000000",
                      border: "1px solid #d0d0d0",
                      "border-radius": "4px",
                      "font-family": "inherit",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemovePreset(preset.id)}
                    style={{
                      padding: "6px 12px",
                      "font-size": "12px",
                      cursor: "pointer",
                      "background-color": "#dc3545",
                      color: "white",
                      border: "none",
                      "border-radius": "4px",
                      "font-family": "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Autosave Indicator */}
      <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
        {saved() && (
          <span
            style={{
              color: "#28a745",
              "font-size": "14px",
              "font-weight": "500",
            }}
          >
            ✓ Saved!
          </span>
        )}
      </div>

      {/* Dialog */}
      <Show when={showDialog()}>
        <div
          onClick={cancelEdit}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            "background-color": "rgba(0, 0, 0, 0.5)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "z-index": "1000",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              "background-color": "white",
              padding: "24px",
              "border-radius": "8px",
              "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.15)",
              width: "90%",
              "max-width": "500px",
            }}
          >
            <h3
              style={{
                "font-size": "18px",
                "font-weight": "600",
                "margin-top": "0",
                "margin-bottom": "20px",
                color: "#000000",
              }}
            >
              {editingPreset() ? "Edit Preset" : "Add Preset"}
            </h3>

            <div
              style={{
                display: "grid",
                "grid-template-columns": "1fr 1fr",
                gap: "16px",
                "margin-bottom": "20px",
              }}
            >
              <div style={{ "grid-column": "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "margin-bottom": "6px",
                    color: "#000000",
                    "font-weight": "500",
                  }}
                >
                  Common Devices
                </label>
                <select
                  onChange={handleDeviceSelect}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    "font-size": "13px",
                    border: "1px solid #d0d0d0",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    "font-family": "inherit",
                    "background-color": "#ffffff",
                    color: "#666",
                  }}
                >
                  <option value="">Select a device to autofill...</option>
                  <optgroup label="Mobile">
                    <option value="iphone-15-pro">
                      iPhone 15 Pro (393×852)
                    </option>
                    <option value="iphone-15-pro-max">
                      iPhone 15 Pro Max (430×932)
                    </option>
                    <option value="iphone-se">iPhone SE (375×667)</option>
                    <option value="pixel-7">Google Pixel 7 (412×915)</option>
                    <option value="galaxy-s23">
                      Samsung Galaxy S23 (360×780)
                    </option>
                  </optgroup>
                  <optgroup label="Tablet">
                    <option value="ipad-mini">iPad Mini (744×1133)</option>
                    <option value="ipad-air">iPad Air (820×1180)</option>
                    <option value="ipad-pro-11">iPad Pro 11" (834×1194)</option>
                    <option value="ipad-pro-13">
                      iPad Pro 13" (1024×1366)
                    </option>
                  </optgroup>
                  <optgroup label="Desktop">
                    <option value="desktop-1080p">
                      Desktop 1080p (1920×1080)
                    </option>
                    <option value="desktop-1440p">
                      Desktop 1440p (2560×1440)
                    </option>
                    <option value="macbook-air">MacBook Air (1440×900)</option>
                    <option value="macbook-pro-14">
                      MacBook Pro 14" (1512×982)
                    </option>
                  </optgroup>
                </select>
              </div>

              <div style={{ "grid-column": "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "margin-bottom": "6px",
                    color: "#000000",
                    "font-weight": "500",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formName()}
                  onInput={(e) => setFormName(e.currentTarget.value)}
                  placeholder="iPhone 15 Pro"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    "font-size": "13px",
                    border: "1px solid #d0d0d0",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    "font-family": "inherit",
                    "background-color": "#ffffff",
                    color: "#000000",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "margin-bottom": "6px",
                    color: "#000000",
                    "font-weight": "500",
                  }}
                >
                  Width (px)
                </label>
                <input
                  type="number"
                  value={formWidth()}
                  onInput={(e) =>
                    setFormWidth(parseInt(e.currentTarget.value) || 0)
                  }
                  min="100"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    "font-size": "13px",
                    border: "1px solid #d0d0d0",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    "font-family": "inherit",
                    "background-color": "#ffffff",
                    color: "#000000",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "margin-bottom": "6px",
                    color: "#000000",
                    "font-weight": "500",
                  }}
                >
                  Height (px)
                </label>
                <input
                  type="number"
                  value={formHeight()}
                  onInput={(e) =>
                    setFormHeight(parseInt(e.currentTarget.value) || 0)
                  }
                  min="100"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    "font-size": "13px",
                    border: "1px solid #d0d0d0",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    "font-family": "inherit",
                    "background-color": "#ffffff",
                    color: "#000000",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                "justify-content": "flex-end",
              }}
            >
              <button
                onClick={cancelEdit}
                style={{
                  padding: "8px 16px",
                  "font-size": "13px",
                  cursor: "pointer",
                  "background-color": "#ffffff",
                  color: "#000000",
                  border: "1px solid #d0d0d0",
                  "border-radius": "4px",
                  "font-family": "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingPreset() ? handleUpdatePreset : handleAddPreset}
                style={{
                  padding: "8px 16px",
                  "font-size": "13px",
                  cursor: "pointer",
                  "background-color": "#000000",
                  color: "#ffffff",
                  border: "none",
                  "border-radius": "4px",
                  "font-family": "inherit",
                  "font-weight": "500",
                }}
                disabled={
                  !formName() || formWidth() < 100 || formHeight() < 100
                }
              >
                {editingPreset() ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;
