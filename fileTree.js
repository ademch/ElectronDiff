const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

class FileNode {
    constructor({ name, fullPath, type, size = 0, mtime = 0 }) {
        this.name = name;
        this.fullPath = fullPath;
        this.type = type; // 'file' or 'dir'
        this.size = size;
        this.mtime = mtime;
        this.hash = null; // only for files
        this.children = new Map(); // for directories
    }
}

class FileTree {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.root = new FileNode({
            name: path.basename(rootPath),
            fullPath: rootPath,
            type: 'dir'
        });

        this.pathMap = new Map();  // fullPath → node
        this.hashMap = new Map();  // hash → [nodes]
    }

    async build() {
        await this._scan(this.rootPath, this.root);
    }

    async _scan(currentPath, parentNode) {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const stats = await fs.promises.stat(fullPath);

            const node = new FileNode({
                name: entry.name,
                fullPath,
                type: entry.isDirectory() ? 'dir' : 'file',
                size: stats.size,
                mtime: stats.mtimeMs
            });

            parentNode.children.set(entry.name, node);
            this.pathMap.set(fullPath, node);

            if (node.type === 'file') {
                node.hash = await this._hashFile(fullPath);

                if (!this.hashMap.has(node.hash)) {
                    this.hashMap.set(node.hash, []);
                }
                this.hashMap.get(node.hash).push(node);
            } else {
                await this._scan(fullPath, node);
            }
        }
    }

    async _hashFile(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha1');
            const stream = fs.createReadStream(filePath);

            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }
}

module.exports = { FileTree };