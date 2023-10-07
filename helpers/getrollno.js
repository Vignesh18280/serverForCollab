function getrollno(id) {
    let flag = false;
    let rollno = "";
    for(let i = 0; i < id.length; i++) {
        if(id[i] === '@') {
            flag = true;
            continue;
        }
        if(flag) {
            rollno += id[i];
        }
    }
    return rollno.toLowerCase();
}

module.exports = getrollno;