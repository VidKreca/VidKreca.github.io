import FileSystem from "./fileSystem.js";

/** CONSTANTS */
const PREFIX = "guest@IE-7 $ ";
const TYPES = ["error", "warning", "success", "info", "special", "prefix", "very-special"];
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
      text: `<span class="success">AVAILABLE COMMANDS:</span>
  <span class="info">help</span>        - show this text
  <span class="info">github</span>      - show my github info
  <span class="info">about</span>       - something about me
  <span class="info">contact</span>     - my contact info
  <span class="info">theme</span>       - change terminal theme
  <span class="info">man</span>         - show manuals for different commands
  <span class="info">echo</span>        - print text to the terminal
  <span class="info">cat</span>         - print file contents to the terminal
  <span class="info">cd</span>          - change working directory
  <span class="info">pwd</span>         - print current working directory
  <span class="info">ls</span>          - list current directory contents
  <span class="info">touch</span>       - make a new file
  <span class="info">md</span>          - make a new folder
  <span class="info">javascript</span>  - run javascript code
  <span class="info">clear</span>       - clear all terminal text
  <span class="info">exit</span>        - exit the terminal
  <span class="info">shutdown</span>    - shutdown the computer
      `,
      type: "custom"
    };
  },
  "man": (args) => {
    return {
      text: `<span class="very-special">Can't be bothered to write this to be honest...</span>`,
      type: "custom"
    }
  },
  "github": () => {
    toggleInput(false);
    showGithubInfo();
  },
  "about": () => {
    return {
      text: `       <span class="error">________________________________</span>
      <span class="error">|</span>                                <span class="error">|</span>
      <span class="error">|</span>     Hello, I'm <span class="success">Vid Kreča</span>,      <span class="error">|</span>
      <span class="error">|</span>     a full-stack developer     <span class="error">|</span>
      <span class="error">|</span>     from Maribor, Slovenia.    <span class="error">|</span>
      <span class="error">|________________________________|</span>
      `,
      type: "info"
    };
  },
  "contact": () => {
    return {
      text: `Not looking for new friends right now...
<a class="special" href="mailto:${atob("dmlka3JlY2E4ODRAZ21haWwuY29t")}?subject=From terminal">Click here to send me an email anyways</a>`,
      type: "warning"
    }
  },
  "echo": (args) => {
    return {
      text: args.join(" ")
    }
  },
  "cd": (args) => {
    try {
      FileSystem.changeDirectory(args.join(" "));
      updatePrefixDirectory(FileSystem.currentDirectory);
    } catch (err) {
      return {
        text: err.message,
        type: "error"
      }
    }
  },
  "pwd": () => {
    return {
      text: `${FileSystem.currentDirectory}`
    }
  },
  "ls": (args) => {
    try {
      const directory = FileSystem.list(!!args.join(" ") ? args.join(" ") : undefined);
      return {
        text: `${Object.entries(directory).map(([key, value]) => {
          if (typeof value === "object") return `<span class="info">${key}</span>`;
          return `<span class="success">${key}</span>`;
        }).join("\n")}`
      }
    } catch (err) {
      return {
        text: err.message,
        type: "error"
      }
    }
  },
  "cat": (args) => {
    try {
      const fileContents = FileSystem.getFileContents(!!args.join(" ") ? args.join(" ") : undefined)
      return {
        text: `${fileContents}`
      }
    } catch (err) {
      return {
        text: err.message,
        type: "error"
      }
    }
  },
  "touch": (args) => {
    try {
      let [filePath, ...content] = args;
      content = content.join(" ");

      const fileName = FileSystem.makeFile(filePath, content);

      return {
        text: `File '${fileName}' created`,
        type: "success"
      }
    } catch (err) {
      return {
        text: err.message,
        type: "error"
      }
    }
  },
  "md": (args) => {
    try {
      let [folderPath] = args;
      const folderName = FileSystem.makeFolder(folderPath);

      return {
        text: `Folder '${folderName}' created`,
        type: "success"
      }
    } catch (err) {
      return {
        text: err.message,
        type: "error"
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
    }, 5000);
  },
  "theme": (args) => {
    if (args.length === 0) {
      return {
        text: `Switch terminal themes.
Usage: theme {name}
Available themes: ${THEMES.join(", ")}

Use 'theme test' to test your current theme.`,
        type: "info"
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
          type: "warning"
        }
      }
      setTheme(theme);
      return;
    }

    return {
      text: `Please only provide one argument.`,
      type: "warning"
    }
  },
  "javascript": (args) => {
    if (args.length === 0) return {
      text: `Please provide some JavaScript code to run.`,
      type: "error"
    }

    eval(args.join(" "));
  },
  "invalid": (command) => {
    return {
      text: `Unknown command '${command}', please use 'help' for a list of commands.`,
      type: "error"
    };
  }
};

/** DEFAULT ELEMENT SETUP */
updatePrefixDirectory(FileSystem.currentDirectory);
if (START_TEXT) appendCommand(createCommandElement(START_TEXT, "special", false));

/** EVENT LISTENERS */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const inputValue = input.value;
    input.value = "";
    command(inputValue);
    commandIndex = null;
  }
  else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (commandHistory.length <= commandIndex) return;
    commandIndex++;
    input.value = commandHistory[commandHistory.length - commandIndex];
  }
  else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (commandIndex <= 0) return;
    commandIndex--;
    input.value = commandHistory[commandHistory.length - commandIndex] ?? "";
  }
  else if (e.key === "Tab") {
    e.preventDefault();
    // TODO - autocomplete here
    const { value } = input;

    if ((value.match(/ /g) ?? []).length === 0) {
      // Autocomplete command
    }
  }
});
document.body.addEventListener("keydown", () => {
  input.focus();
  input.scrollIntoView();
});



function command(inputText) {
  commandHistory.push(inputText);
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const commandLogText = `${timestamp} ${prefix.textContent}`;
  appendCommand(createCommandElement(`<span class="prefix">${commandLogText}</span> ${inputText}`, "custom"));

  let [command, ...args] = inputText.split(" ");
  command = command.trim().toLowerCase();

  if (Object.keys(commands).includes(command)) {
    let output = commands[command](args);
    if (typeof output === "string") output = commands[output]();
    if (output?.text) appendCommand(createCommandElement(output.text, output.type));
  } else {
    if (command === "") return;
    const output = commands.invalid(command);
    appendCommand(createCommandElement(output.text, output.type));
  }
}

function appendCommand(element) {
  commandsContainer.appendChild(element);
  input.scrollIntoView();
}

function createCommandElement(text, type) {
  const container = document.createElement("div");
  container.classList.add("command");
  if (TYPES.includes(type)) container.classList.add(type);

  const commandElement = document.createElement("p");
  commandElement.innerHTML = `${text}`;
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
  appendCommand(createCommandElement("prefix text", "prefix", false));
  appendCommand(createCommandElement("regular text", undefined, false));
  appendCommand(createCommandElement("success text", "success", false));
  appendCommand(createCommandElement("info text", "info", false));
  appendCommand(createCommandElement("warning text", "warning", false));
  appendCommand(createCommandElement("error text", "error", false));
  appendCommand(createCommandElement("special text", "special", false));
  appendCommand(createCommandElement("very special text woooooooooooow", "very-special", false));
}


function updatePrefixDirectory(directory) {
  prefix.textContent = `${directory} ${PREFIX}`;
}