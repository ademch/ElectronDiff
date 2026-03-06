

const { FileTree } = require('./fileTree');

(async () => {
    const treeA = new FileTree('C:/folderA');
    const treeB = new FileTree('C:/folderB');

    await treeA.build();
    await treeB.build();

    console.log('Tree A files:', treeA.pathMap.size);
    console.log('Tree B files:', treeB.pathMap.size);
})();