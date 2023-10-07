function check(followers, follower_id) {
    let flag = true;
    for(let i = 0; i < followers.length; i++) {
        let k = 0;
        for(let j = 0; j < followers[i].length; j++) {
            if(followers[i][j] === follower_id[k]) {
                k++;
            }
            else break;
        }
        if(k === followers[i].length) {
            flag = false;
        }
    }
    return flag;
}

module.exports = check;