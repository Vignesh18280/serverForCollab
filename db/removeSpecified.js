function removedSpecified(id, collection) {
    for(let i = 0; i < collection.length; i++) {
        if(collection[i].id === id) {
            collection.splice(i, 1);
            break;
        }
    }
    return collection;
}

module.exports = removedSpecified;