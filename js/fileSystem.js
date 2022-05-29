/**
 * SHOULD SUPPORT:
 * - ls
 * - md
 * - touch
 * - cd
 * - rm
 * - 
 * 
 * IDEAS:
 * - add localStorage support
 */
class FileSystem {
  constructor() {
    this.root = {
      "file1": "this is a file with text contents",
      "folder1": {
        "file2": "this is file2",
        "folder2": {}
      }
    };       // Root folder
    this.pointer = null;  // Pointer to currently selected directory
  }

  pointerValue(pointer) {
    if (pointer === null || pointer === "") return this.root;
    const value = pointer.split(".").reduce((o, i) => o?.[i], this.root);
    if (value !== undefined) return value;
    throw new Error(`Invalid pointer value '${pointer}'`);
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
  getFile() {}

  /**
   * Changes current directory
   */
  changeDirectory(relativePath) {
    const currentPointer = (this.pointer ?? "").split(".")[0] === "" ? [] : this.pointer.split(".");
    relativePath = relativePath.split("/");

    // Parse .. at the beginning of the relative path
    while (relativePath[0] === "..") {
      if (currentPointer.length === 0) throw new Error("Could not go back any further.");
      currentPointer.pop();
      relativePath.shift();
    }

    // Parse folders
    while (relativePath.length > 0) {
      const folder = relativePath[0];

      // Check if folder exists in the hierarchy
      if (!(folder in this.pointerValue(currentPointer.join(".")))) {
        throw new Error(`No such folder '${folder}'.`);
      }

      currentPointer.push(folder);
      relativePath.shift();

      // Check if 'folder' is a file
      if (typeof this.pointerValue(currentPointer.join(".")) !== "object") {
        throw new Error(`'${folder}' is a file.`);
      }
    }

    this.pointer = currentPointer.join(".");
  }
};

export default new FileSystem();