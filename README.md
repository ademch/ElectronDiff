Why This Is Optimized for Comparison

1️ Fast path comparison
if (!treeB.pathMap.has(file.fullPath)) → deleted

2️ Fast rename/move detection
if (treeB.hashMap.has(file.hash)) → renamed or moved

3️ Detect duplicates easily
If hashMap.get(hash).length > 1

Usage example
function detectNewAndDeleted(treeA, treeB) {
    const newFiles = [];
    const deletedFiles = [];

    // Check for new files (in B, not in A)
    for (const [fullPath, nodeB] of treeB.pathMap) {
        if (!treeA.pathMap.has(fullPath)) {
            newFiles.push(nodeB);
        }
    }

    // Check for deleted files (in A, not in B)
    for (const [fullPath, nodeA] of treeA.pathMap) {
        if (!treeB.pathMap.has(fullPath)) {
            deletedFiles.push(nodeA);
        }
    }

    return { newFiles, deletedFiles };
}
