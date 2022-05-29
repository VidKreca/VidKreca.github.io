/**
 * SHOULD SUPPORT:
 * - ls
 * - md
 * - touch
 * - cd
 * - rm
 * - cat
 * 
 * IDEAS:
 * - add localStorage support
 */
class FileSystem {
  constructor() {
    this.root = {
      "file1": "file1 contents...",
      "folder1": {
        "file2": "file2 contents...",
        "folder2": {}
      }
    };       // Root folder
    this.pointer = null;  // Pointer to currently selected directory
  }

  get currentDirectory() {
    return `./${this.pointer ?? ""}`;
  }

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

  makeFile() {}
  makeFolder() {}

  /**
   * Returns an object of the current directory
   */
  list(pointer) {
    return this.pointerValue(pointer ?? this.pointer);
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