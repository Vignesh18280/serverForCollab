function getrollno(id) {
    let flag = false;
    // let cnt = 0;
    // let rollno = "";
    // let collcode = "";
    // for(let i = 0; i < id.length; i++) {
    //     if(id[i] === '@') {
    //         if(cnt === 1) {
    //             break;
    //         }
    //         else cnt++;
    //         flag = true;
    //     }
    //     if(flag) {
    //         rollno += id[i];
    //     }
    //     else {
    //         collcode += id[i];
    //     }
    // }
    // collcode = collcode.toUpperCase();
    // return collcode + rollno.toLowerCase();
    const resarr = id.split('@');
    const collcode = resarr[0];
    const rollno = resarr[1];
    // for(let i = 0; i < resarr.length; i++) {
    //     console.log(resarr[i]);
    // }
    console.log(resarr);
    return collcode + '@' + rollno;
}

module.exports = getrollno;