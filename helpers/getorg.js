function getorg(id) {
    let org = "";
    let flag = true;
    for(let i = 0; i < id.length; i++) {
        if(id[i] === '@') {
            flag = false;
        }
        if(flag) {
            org += id[i];
        }
        else break;
    }
    return org.toUpperCase();
}

module.exports = getorg;