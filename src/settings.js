import { KeybindsInput } from "./keybindsInput.js";
import winCounter from "./winCounter.js";
import WindowManager from "./windowManager.js";
import versionData from '../version.json';
import { displayChangelog } from './changelog.js';

window.__fx = window.__fx || {};
const __fx = window.__fx;

var settings = {
  //"fontName": "Trebuchet MS",
  //"showBotDonations": false,
  displayWinCounter: true,
  displayTickNumber: true,
  useFullscreenMode: false,
  hoveringTooltip: true,
  //"hideAllLinks": false,
  realisticNames: false,
  showPlayerDensity: true,
  coloredDensity: true,
  densityDisplayStyle: "absoluteQuotient",
  hideBotNames: false,
  highlightClanSpawns: false,
  detailedTeamPercentage: false,
  openDonationHistoryFromLb: true,
  //"customMapFileBtn": true
  customBackgroundUrl: "",
  keybindButtons: false,
  attackPercentageKeybinds: [],
  hidePropagandaPopup: false,
  showReplayTimebar: true
};
__fx.settings = settings;
const discontinuedSettings = ["hideAllLinks", "fontName"];
__fx.makeMainMenuTransparent = false;

/*var settingsGearIcon = document.createElement('img');
settingsGearIcon.setAttribute('src', 'assets/geari_white.png');*/

function ReplayHistoryList(container) {
  const title = document.createElement("p");
  title.innerHTML = "<b>Saved Replays</b> (auto-saves your last 5 games)";
  container.append(title);

  const list = document.createElement("div");
  container.append(list);

  function formatTime(timestamp) {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    return Math.floor(hours / 24) + "d ago";
  }

  function render() {
    list.innerHTML = "";
    if (!__fx.replayHistory) return; // not initialized yet
    const replays = __fx.replayHistory.getAll();
    if (!replays.length) {
      const empty = document.createElement("small");
      empty.innerText = "No replays saved yet. Finish a game and it'll show up here.";
      list.append(empty);
      return;
    }
    replays.forEach((replay) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "6px";
      row.style.marginBottom = "4px";

      const label = document.createElement("small");
      label.innerText = formatTime(replay.timestamp);
      label.style.flex = "1";

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.innerText = "Load";
      loadBtn.addEventListener("click", () => {
        WindowManager.closeWindow("settings");
        __fx.replayHistory.load(replay.data);
      });

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.innerText = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(replay.data).then(() => {
          copyBtn.innerText = "Copied!";
          setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
        }).catch(() => alert("Could not copy automatically \u2014 select the text manually."));
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.innerText = "Delete";
      deleteBtn.addEventListener("click", () => {
        __fx.replayHistory.remove(replay.timestamp);
        render();
      });

                  const downloadBtn = document.createElement("button");
      downloadBtn.type = "button";
      downloadBtn.innerText = "Download";
      downloadBtn.addEventListener("click", () => {
        const blob = new Blob([replay.data], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `replay_${replay.timestamp}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      });

      row.append(label, loadBtn, copyBtn, deleteBtn, downloadBtn);
      list.append(row);
    });
  }

  this.update = render;
}

const settingsManager = new (function () {
  const settingsStructure = [
    {
      for: "displayWinCounter",
      type: "checkbox",
      label: "Display win counter",
      note: "The win counter tracks multiplayer solo wins (not in team games)",
    },
    {
      type: "button",
      text: "Reset win counter",
      action: winCounter.removeWins,
    },
    {
      for: "displayTickNumber",
      type: "checkbox",
      label: "Display tick number near the balance",
    },
    {
      for: "useFullscreenMode",
      type: "checkbox",
      label: "Use fullscreen mode",
      note: "Note: fullscreen mode will trigger after you click anywhere on the page due to browser policy restrictions.",
    },
    {
      for: "hoveringTooltip",
      type: "checkbox",
      label: "Hovering tooltip",
      note: "Display map territory info constantly (on mouse hover) instead of only when right clicking on the map",
    },
    //{ for: "hideAllLinks", type: "checkbox", label: "Hide Links option also hides app store links" },
    { for: "realisticNames", type: "checkbox", label: "Realistic Bot Names" },
    {
      for: "showPlayerDensity",
      type: "checkbox",
      label: "Show player density",
    },
    {
      for: "coloredDensity",
      type: "checkbox",
      label: "Colored density",
      note: "Display the density with a color between red and green depending on the density value",
    },
    {
      for: "densityDisplayStyle",
      type: "selectMenu",
      label: "Density value display style:",
      tooltip: "Controls how the territorial density value should be rendered",
      options: [
        { value: "percentage", label: "Percentage" },
        {
          value: "absoluteQuotient",
          label: "Value from 0 to 150 (BetterTT style)",
        },
      ],
    },
    { for: "hideBotNames", type: "checkbox", label: "Hide bot names" },
    {
      for: "highlightClanSpawns",
      type: "checkbox",
      label: "Highlight clan spawnpoints",
      note: "Increases the spawnpoint glow size for members of your clan",
    },
    {
      for: "hidePropagandaPopup",
      type: "checkbox",
      label: "Hide propaganda popup"
    },
    {
      for: "detailedTeamPercentage", type: "checkbox",
      label: "Detailed team pie chart percentage",
      note: "For example: this would show 25.82% instead of 26% on the pie chart in team games"
    },
    {
      for: "openDonationHistoryFromLb",
      type: "checkbox",
      label: "Open donation history from the leaderboard",
      note: "Changes whether or not clicking on a player's name in the in-game leaderboard in team games will open their donation history",
    },
    {
      for: "customBackgroundUrl",
      type: "textInput",
      label: "Custom main menu background:",
      placeholder: "Enter an image URL here",
      tooltip:
        "A custom image to be shown as the main menu background instead of the currently selected map.",
    },
    KeybindsInput,
    {
      for: "keybindButtons", type: "checkbox",
      label: "Keybind buttons", note: "Show keybind buttons above the troop selector (max 6)"
    },
    {
      for: "showReplayTimebar",
      type: "checkbox",
      label: "Replay timebar",
      note: "Show a seek bar when watching replays, allowing you to skip to any point of the replay. Seeking backward re-simulates the replay from the start, which can take a few seconds.",
    },
    ReplayHistoryList,
    function Footer(container) {
      const versionInfo = document.createElement("p");
      versionInfo.innerText = `FX Client v${versionData.version}`;
      const links = document.createElement("p");
      links.innerHTML = `<a href="https://discord.gg/dyxcwdNKwK" target="_blank">Discord server</a> |
        <a href="https://github.com/fxclient/FXclient#readme">Github repository</a>`;
      const changelogButton = document.createElement("button");
      changelogButton.innerText = "Changelog";
      changelogButton.addEventListener("click", displayChangelog);
      container.append(versionInfo, links, changelogButton);
    }
  ];
  const settingsContainer = document.querySelector(".settings .scrollable");
  var inputFields = {}; // (includes select menus)
  var checkboxFields = {};
  var customElements = [];
  settingsStructure.forEach((item) => {
    if (typeof item === "function") {
      const container = document.createElement("div");
      customElements.push(new item(container));
      return settingsContainer.append(container);
    }
    const label = document.createElement("label");
    if (item.tooltip) label.title = item.tooltip;
    const isValueInput = item.type.endsWith("Input");
    const element = document.createElement(
      isValueInput || item.type === "checkbox"
        ? "input"
        : item.type === "selectMenu"
        ? "select"
        : "button"
    );
    if (item.type === "textInput") element.type = "text";
    if (item.placeholder) element.placeholder = item.placeholder;
    if (isValueInput || item.type === "selectMenu")
      inputFields[item.for] = element;
    if (item.text) element.innerText = item.text;
    if (item.action) element.addEventListener("click", item.action);
    if (item.label) label.append(item.label + " ");
    if (item.note) {
      const note = document.createElement("small");
      note.innerText = item.note;
      label.append(document.createElement("br"), note);
    }
    if (item.options)
      item.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.setAttribute("value", option.value);
        optionElement.innerText = option.label;
        element.append(optionElement);
      });
    label.append(element);
    if (item.type === "checkbox") {
      element.type = "checkbox";
      const checkmark = document.createElement("span");
      checkmark.className = "checkmark";
      label.className = "checkbox";
      label.append(checkmark);
      checkboxFields[item.for] = element;
    } else label.append(document.createElement("br"));
    settingsContainer.append(label, document.createElement("br"));
  });
  this.save = function () {
    Object.keys(inputFields).forEach(function (key) {
      settings[key] = inputFields[key].value.trim();
    });
    Object.keys(checkboxFields).forEach(function (key) {
      settings[key] = checkboxFields[key].checked;
    });
    this.applySettings();
    WindowManager.closeWindow("settings");
    discontinuedSettings.forEach((settingName) => delete settings[settingName]);
    localStorage.setItem("fx_settings", JSON.stringify(settings));
    window.location.reload();
  };

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  function handleFileSelect(event) {
    const input = event.target;
    /** @type {File} */
    const selectedFile = input.files[0];
    if (!selectedFile) return;

    input.removeEventListener("change", handleFileSelect);
    input.value = "";
    if (!selectedFile.name.endsWith(".json"))
      return alert("Invalid file format");
    const fileReader = new FileReader();
    fileReader.onload = function () {
      let result;
      try {
        result = JSON.parse(fileReader.result);
        if (
          confirm(
            'Warning: This will override all current settings, click "OK" to confirm'
          )
        )
          __fx.settings = settings = result;
        localStorage.setItem("fx_settings", JSON.stringify(settings));
        window.location.reload();
      } catch (error) {
        alert("Error\n" + error);
      }
    };
    fileReader.readAsText(selectedFile);
  }
  this.importFromFile = function () {
    fileInput.click();
    fileInput.addEventListener("change", handleFileSelect);
  };
  // https://stackoverflow.com/a/34156339
  function saveFile(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  this.exportToFile = function () {
    saveFile(
      JSON.stringify(settings),
      "FX_client_settings.json",
      "application/json"
    );
  };

  this.syncFields = function () {
    Object.keys(inputFields).forEach(function (key) {
      inputFields[key].value = settings[key];
    });
    Object.keys(checkboxFields).forEach(function (key) {
      checkboxFields[key].checked = settings[key];
    });
    customElements.forEach((element) => element.update?.(settings));
  };
  this.resetAll = function () {
    if (
      !confirm(
        "Are you Really SURE you want to RESET ALL SETTINGS back to the default?"
      )
    )
      return;
    localStorage.removeItem("fx_settings");
    window.location.reload();
  };
  this.applySettings = function () {
    //setVarByName("bu", "px " + settings.fontName);

    if (settings.customBackgroundUrl !== "") {
      document.body.style.backgroundImage =
        "url(" + settings.customBackgroundUrl + ")";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }
    __fx.makeMainMenuTransparent = settings.customBackgroundUrl !== "";
  };

  if (settings.useFullscreenMode) tryEnterFullscreen();
})();

export function tryEnterFullscreen() {
  if (document.fullscreenElement !== null || !document.fullscreenEnabled) return;
  document.documentElement
    .requestFullscreen({ navigationUI: "hide" })
    .then(() => {
      console.log("Fullscreen mode activated");
    })
    .catch((error) => {
      console.warn("Could not enter fullscreen mode:", error);
    });
}

const openCustomBackgroundFilePicker = () => {
  const fileInput = document.getElementById("customBackgroundFileInput");
  fileInput.click();
  fileInput.addEventListener("change", handleFileSelect);
};
function handleFileSelect(event) {
  const fileInput = event.target;
  const selectedFile = fileInput.files[0];
  console.log(fileInput.files);
  console.log(fileInput.files[0]);
  if (selectedFile) {
    const fileUrl = URL.createObjectURL(selectedFile);
    console.log("File URL:", fileUrl);
    fileInput.value = "";
    fileInput.removeEventListener("change", handleFileSelect);
  }
}

WindowManager.add({
  name: "settings",
  element: document.querySelector(".settings"),
  beforeOpen: function () {
    settingsManager.syncFields();
  },
});

if (localStorage.getItem("fx_settings") !== null) {
  __fx.settings = settings = {
    ...settings,
    ...JSON.parse(localStorage.getItem("fx_settings")),
  };
}
settingsManager.applySettings();

export default settingsManager;
export function getSettings() {
  return settings;
}
