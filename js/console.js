import FileSystem from "./fileSystem.js";

/** CONSTANTS */
const PREFIX = "guest@IE-7 $ ";
const TYPES = ["error", "warning", "success", "info", "special"];
const START_TEXT = 
`Welcome to my console.
Useful commands:
  'help' for a list of available commands
  'exit' to go back

`;
const REPOS = ["QuickSorts", "the-place"];
const THEMES = ["default", "ubuntu", "cmd", "gray"];

/** ELEMENTS */
const input = document.querySelector("#input");
const inputContainer = document.querySelector("#inputContainer");
const prefix = document.querySelector("#prefix");
const commandsContainer = document.querySelector("#commandsContainer");
const shutdown = document.querySelector(".shutdown");

/** VARIABLES */
const commandHistory = [];
let commandIndex = 0;
const commands = {
  "help": () => {
    return {
      text: `AVAILABLE COMMANDS:
  help
  github
  about
  contact
  theme
  clear
  exit
      `,
      type: "info",
      showPrefix: false
    };
  },
  "github": () => {
    toggleInput(false);
    showGithubInfo();
  },
  "about": () => {
    return {
      text: `       ________________________________
      |                                |
      |     Hello, I'm Vid Kreča,      |
      |     a full-stack developer     |
      |     from Maribor, Slovenia.    |
      |________________________________|
      `,
      type: "info",
      showPrefix: false
    };
  },
  "contact": () => {
    return {
      text: `Not looking for new friends right now...`,
      type: "warning",
      showPrefix: false
    }
  },
  "secret": () => {
    return {
      text: `Unlisted commands: echo, cd, pwd, ls, shutdown`,
      type: "special",
      showPrefix: false
    }
  },
  "echo": (args) => {
    return {
      text: args.join(" "),
      showPrefix: false
    }
  },
  "cd": (args) => {
    try {
      FileSystem.changeDirectory(args.join(" "));
    } catch (err) {
      return {
        text: err.message,
        type: "error",
        showPrefix: false
      }
    }
  },
  "pwd": () => {
    return {
      text: `${FileSystem.pointer}`,
      showPrefix: false
    }
  },
  "ls": (args) => {
    try {
      const directory = FileSystem.list(!!args.join(" ") ? args.join(" ") : undefined);
      return {
        text: `${Object.keys(directory).join("\n")}`,
        showPrefix: false
      }
    } catch (err) {
      return {
        text: err.message,
        type: "error",
        showPrefix: false
      }
    }
  },
  "clear": () => {
    commandsContainer.innerHTML = "";
  },
  "cls": () => "clear",
  "exit": () => {
    history.back();
  },
  "shutdown": () => {
    shutdown.classList.remove("hidden");

    setTimeout(() => {
      shutdown.classList.add("hidden");
      appendCommand(createCommandElement("Could not shut down the computer.", "error", false));
    }, 6000);
  },
  "theme": (args) => {
    if (args.length === 0) {
      return {
        text: `Switch terminal themes.
Usage: theme {name}
Available themes: ${THEMES.join(", ")}

Use 'theme test' to test your current theme.`,
        type: "info",
        showPrefix: false
      }
    }

    if (args.length === 1) {
      let [theme] = args;

      if (theme === "test") {
        showThemeShowcase();
        return;
      }

      theme = theme.toLowerCase().trim();
      if (!THEMES.includes(theme)) {
        return {
          text: `Invalid theme name '${theme}'.
Available themes: ${THEMES.join(", ")}`,
          type: "warning",
          showPrefix: false
        }
      }
      setTheme(theme);
      return;
    }

    return {
      text: `Please only provide one argument.`,
      type: "warning",
      showPrefix: false
    }
  },
  "javascript": (args) => {
    eval(args.join(" "));
  },
  "invalid": (command) => {
    return {
      text: `Unknown command '${command}', please use 'help' for a list of commands.`,
      type: "error",
      showPrefix: false
    };
  }
};

/** DEFAULT ELEMENT SETUP */
prefix.textContent = PREFIX;
if (START_TEXT) appendCommand(createCommandElement(START_TEXT, "special", false));

/** EVENT LISTENERS */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const inputValue = input.value;
    input.value = "";
    command(inputValue);
    commandIndex = null;
  }
  else if (e.key === "ArrowUp") {
    if (commandHistory.length <= commandIndex) return;
    commandIndex++;
    input.value = commandHistory[commandHistory.length - commandIndex];
  }
  else if (e.key === "ArrowDown") {
    if (commandIndex <= 0) return;
    commandIndex--;
    input.value = commandHistory[commandHistory.length - commandIndex] ?? "";
  }
});
document.body.addEventListener("keydown", () => {
  input.focus();
  input.scrollIntoView();
});



function command(inputText) {
  commandHistory.push(inputText);
  appendCommand(createCommandElement(inputText));

  let [command, ...args] = inputText.split(" ");
  command = command.trim().toLowerCase();

  if (Object.keys(commands).includes(command)) {
    let output = commands[command](args);
    if (typeof output === "string") output = commands[output]();
    if (output?.text) appendCommand(createCommandElement(output.text, output.type, output.showPrefix));
  } else {
    const output = commands.invalid(command);
    appendCommand(createCommandElement(output.text, output.type, output.showPrefix));
  }
}

function appendCommand(element) {
  commandsContainer.appendChild(element);
  input.scrollIntoView();
}

function createCommandElement(text, type, showPrefix = true) {
  const container = document.createElement("div");
  container.classList.add("command");
  if (TYPES.includes(type)) container.classList.add(type);

  const commandElement = document.createElement("p");
  if (showPrefix) {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    commandElement.innerHTML = `${timestamp} ${PREFIX} ${text}`;
  } else {
    commandElement.innerHTML = `${text}`;
  }
  container.appendChild(commandElement);
  return container;
}

/**
 * @param {*} state is disabled?
 */
function toggleInput(state) {
  const value = state ?? !inputContainer.classList.contains("disabled");
  input.disabled = value;
  inputContainer.classList.toggle("disabled", value);
}

async function showGithubInfo() {
  let user = null;
  let repos = null;

  const showError = () => {
    appendCommand(createCommandElement("Could not load info from Github.", "error", false));
    toggleInput(false);
  }

  try {
    const responses = await Promise.all([
      fetch("https://api.github.com/users/vidkreca"), 
      ...REPOS.map((repo) => fetch(`https://api.github.com/repos/vidkreca/${repo}`))
    ]);
    [user, ...repos] = await Promise.all(responses.map((res) => res.json()));
  } catch (err) {
    showError();
    return;
  }

  let reposText = "";
  if (repos.length > 0) {
    reposText = `
      <div class="repos">
        <h1>Here's ${repos.length} of my repos</h1>
        ${repos.map(repo => `<div class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          <p>${repo.description}</p>
        </div>`).join("")}
      </div>
    `;
  }

  const createdAt = new Date(user.created_at);
  const createdAtPretty = `${createdAt.getDate().toString().padStart(2, "0")}.${createdAt.getMonth().toString().padStart(2, "0")}.${createdAt.getFullYear().toString().padStart(2, "0")}`
  const text = `<div class="github-command"><div class="profile">
        <img src="${user.avatar_url}">
        <a href="${user.html_url}" target="_blank">My profile</a>
      </div>
      <div class="info">
        <h4>${user.public_repos} public repos</h4>
        <h4>created at ${createdAtPretty}</h4>
      </div>${reposText}</div>
      `;
    appendCommand(createCommandElement(text, "special", false));

  toggleInput(false);
}

function setTheme(theme) {
  const name = theme => `${theme}Theme`;
  THEMES.forEach(theme => document.body.classList.remove(name(theme)))

  if (theme !== "default") document.body.classList.add(name(theme));
}

function showThemeShowcase() {
  appendCommand(createCommandElement("regular text", undefined, false));
  appendCommand(createCommandElement("success text", "success", false));
  appendCommand(createCommandElement("info text", "info", false));
  appendCommand(createCommandElement("warning text", "warning", false));
  appendCommand(createCommandElement("error text", "error", false));
  appendCommand(createCommandElement("special text", "special", false));
}