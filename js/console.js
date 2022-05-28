/** CONSTANTS */
const PREFIX = "$ ";

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
      `,
      type: "info"
    };
  },
  "invalid": () => {
    return {
      text: `Unknown command, please use 'help' for a list of commands.`,
      type: "error"
    };
  }
};

/** EVENT LISTENERS */
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const inputValue = input.value;
    input.value = "";
    command(inputValue);
  }
});
input.addEventListener("blur", () => setTimeout(() => input.focus()));



function command(command) {
  commandHistory.push(command);
  commandsContainer.appendChild(createCommandElement(command));

  if (Object.keys(commands).includes(command)) {
    const output = commands[command]();
    if (output.text) commandsContainer.appendChild(createCommandElement(output.text, output.type));
  } else {
    const output = commands.invalid();
    commandsContainer.appendChild(createCommandElement(output.text, output.type));
  }
}

function createCommandElement(command, type) {
  const container = document.createElement("div");
  container.classList.add("command");
  if (["error", "warning", "success", "info"].includes(type)) container.classList.add(type);

  const span = document.createElement("span");
  const timestamp = new Date().toISOString().slice(11, 19);
  span.textContent = `${timestamp}>${PREFIX} ${command}`;
  container.appendChild(span);
  return container;
}