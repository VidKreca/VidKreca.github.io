/**
 * TODO:
 * - rm
 * 
 * IDEAS:
 * - add localStorage support (implementation idea: proxy the root object)
 */
class FileSystem {
  constructor() {
    this.root = {
      "README": "I don't have anything important to say.",
      "secrets": {
        "my_passwords": "reddit: hunter2",
        "empty_folder": {
          "i_lied": ""
        }
      }
    };       // Root folder
    this.pointer = null;  // Pointer to currently selected directory
  }

  /**
   * Formatted current pointer
   */
  get currentDirectory() {
    return `./${(this.pointer ?? "").replace(".", "/")}`;
  }

  /**
   * Convert a string pointer value into the actual object value 
   * @param {*} pointer string pointer value
   * @returns object or file contents
   */
  pointerValue(pointer) {
    if (pointer === null || pointer === "") return this.root;
    const value = pointer.split(".").reduce((o, i) => o?.[i], this.root);
    if (value !== undefined) return value;
    throw new Error(`Invalid pointer value '${pointer}'`);
  }

  parseRelativePathToFolder(relativePath) {
    const currentPointer = (this.pointer ?? "").split(".")[0] === "" ? [] : this.pointer.split(".");
    relativePath = relativePath.split("/");

    // Parse .. at the beginning of the relative path
    while (relativePath[0] === "..") {
      if (currentPointer.length === 0) throw new Error("Could not go back any further");
      currentPointer.pop();
      relativePath.shift();
    }

    // Parse folders
    while (relativePath.length > 0) {
      const folder = relativePath[0];

      // Check if folder exists in the hierarchy
      if (!(folder in this.pointerValue(currentPointer.join(".")))) {
        throw new Error(`No such folder '${folder}'`);
      }

      currentPointer.push(folder);
      relativePath.shift();

      // Check if 'folder' is a file
      if (typeof this.pointerValue(currentPointer.join(".")) !== "object") {
        throw new Error(`'${folder}' is a file`);
      }
    }

    return currentPointer.join(".");
  }

  /**
   * Make a new file
   * @param {*} relativePath relative path to file with file name
   * @param {*} content content to write into the file
   * @returns file name
   */
  makeFile(relativePath, content = "") {
    if (!relativePath) throw new Error(`Please provide a single file path`);

    relativePath = relativePath.split("/");
    const fileName = relativePath.pop();

    const folderPointer = relativePath.length > 0 ? this.parseRelativePathToFolder(relativePath.join("/")) : this.pointer;
    const folder = this.pointerValue(folderPointer);

    if (typeof folder !== "object") throw new Error(`Path '${folderPointer}' does not lead to a folder`);
    if (folder[fileName] !== undefined) throw new Error(`File '${fileName}' already exists in folder '${folderPointer}'`)

    folder[fileName] = content;

    return fileName;
  }

  /**
   * Make a new folder
   * @param {*} relativePath relative path to folder
   * @returns folder name
   */
  makeFolder(relativePath) {
    if (!relativePath) throw new Error(`Please provide a single folder path`);

    relativePath = relativePath.split("/");
    const folderName = relativePath.pop();

    const folderPointer = relativePath.length > 0 ? this.parseRelativePathToFolder(relativePath.join("/")) : this.pointer;
    const folder = this.pointerValue(folderPointer);

    if (typeof folder !== "object") throw new Error(`Path '${folderPointer}' does not lead to an existing folder`);
    if (folder[folderName] !== undefined) throw new Error(`Folder '${folderName}' already exists in folder '${folderPointer}'`)

    folder[folderName] = {};

    return folderName;
  }

  /**
   * Returns an object of the current directory
   */
  list(pointer) {
    const contents = this.pointerValue(pointer ?? this.pointer);
    if (Object.keys(contents).length === 0) throw new Error("Directory is empty");
    return contents;
  }

  /**
   * Returns file contents
   */
  getFileContents(relativePath) {
    if (!relativePath) throw new Error(`Please provide a single file path`);

    relativePath = relativePath.split("/");
    const fileName = relativePath.pop();

    const folderPointer = relativePath.length > 0 ? this.parseRelativePathToFolder(relativePath.join("/")) : this.pointer;
    const folder = this.pointerValue(folderPointer);

    if (typeof folder !== "object") throw new Error(`Path '${folderPointer}' does not lead to a folder`);
    if (folder[fileName] === undefined) throw new Error(`File '${fileName}' does not exist in folder '${folderPointer}'`)
    if (typeof folder[fileName] === "object") throw new Error(`'${fileName}' is a folder, not a file`)

    return folder[fileName];
  }

  /**
   * Changes current directory
   */
  changeDirectory(relativePath) {
    this.pointer = this.parseRelativePathToFolder(relativePath);
  }
};

export default new FileSystem();