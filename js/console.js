/** CONSTANTS */
const PREFIX = "guest@internet-explorer-7 $ ";
const TYPES = ["error", "warning", "success", "info", "special"];
const START_TEXT = 
`Welcome to my console.
Use the 'help' command for a list of available commands.

`;

/** ELEMENTS */
const input = document.querySelector("#input");
const prefix = document.querySelector("#prefix");
const commandsContainer = document.querySelector("#commandsContainer");

/** VARIABLES */
const commandHistory = [];
const commands = {
  "help": () => {
    return {
      text: `AVAILABLE COMMANDS:
  help
  about
  contact
  clear
      `,
      type: "info",
      showPrefix: false
    };
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
      text: `very secret`,
      type: "special",
      showPrefix: false
    }
  },
  "cd": () => {
    return {
      text: `No, I did not implement a file system... yet.`,
      type: "error",
      showPrefix: false
    }
  },
  "pwd": () => "cd",
  "ls": () => "cd",
  "clear": () => {
    commandsContainer.innerHTML = "";
  },
  "invalid": () => {
    return {
      text: `Unknown command, please use 'help' for a list of commands.`,
      type: "error",
      showPrefix: false
    };
  }
};

/** DEFAULT ELEMENT SETUP */
prefix.textContent = PREFIX;
if (START_TEXT) commandsContainer.appendChild(createCommandElement(START_TEXT, "special", false));

/** EVENT LISTENERS */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const inputValue = input.value;
    input.value = "";
    command(inputValue);
  }
  // TODO - add support for arrow up and down
});
document.body.addEventListener("keydown", () => input.focus());



function command(inputText) {
  commandHistory.push(inputText);
  commandsContainer.appendChild(createCommandElement(inputText));

  const [command, ...args] = inputText.split(" ");

  if (Object.keys(commands).includes(command)) {
    let output = commands[command]();
    if (typeof output === "string") output = commands[output]();
    if (output?.text) commandsContainer.appendChild(createCommandElement(output.text, output.type, output.showPrefix));
  } else {
    const output = commands.invalid();
    commandsContainer.appendChild(createCommandElement(output.text, output.type, output.showPrefix));
  }
}

function createCommandElement(text, type, showPrefix = true) {
  const container = document.createElement("div");
  container.classList.add("command");
  if (TYPES.includes(type)) container.classList.add(type);

  const span = document.createElement("span");
  if (showPrefix) {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    span.innerHTML = `${timestamp} ${PREFIX} ${text}`;
  } else {
    span.innerHTML = `${text}`;
  }
  container.appendChild(span);
  return container;
}