#!/bin/bash
set -e

HERE=$(cd -L $(dirname -- $0); pwd)
export PATH="$HERE/node_modules/.bin":"$PATH"
export GIT_DIR="$HERE/.git"
export GIT_INDEX_FILE=$(mktemp "$GIT_DIR/TEMP.XXXXXX")

function gentree() {
    echo "100644 blob $(git hash-object -w <(bundle essays/digger/index.js))"$'\t'"bundle.js"
    echo "100644 blob $(git hash-object -w fusion.js)"$'\t'"fusion.js"
    echo "100644 blob $(git hash-object -w essays/digger/index.css)"$'\t'"index.css"
    echo "100644 blob $(git hash-object -w node_modules/colorim.html/index.css)"$'\t'"colorim.css"
    echo "100644 blob $(git hash-object -w essays/digger/bundle.html)"$'\t'"index.html"
    echo "100644 blob $(git hash-object -w essays/digger/CNAME)"$'\t'"CNAME"
}

OVERLAY=$(gentree | git mktree)
git read-tree --empty
git read-tree --prefix=/ $OVERLAY
TREE=$(git write-tree --missing-ok)
# PARENT=$(git rev-parse refs/heads/master)
COMMIT=$(git commit-tree $TREE < <(echo Bundle world editor))
git update-ref refs/heads/delve-gh-pages $COMMIT

rm $GIT_INDEX_FILE
