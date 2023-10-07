function check_desc(string1, string2) {
    // check if string1 is a substring of string2
    // if yes, return true
    // else return false
    return string2.includes(string1);
}

function check_title(string1, string2) {
    // check if string1 is a substring of string2
    // if yes, return true
    // else return false
    return string2.includes(string1);
}

function check_plag(objcheck, array_of_objects) {
    for(let i = 0; i < array_of_objects.length; i++) {
        if(check_title(objcheck.title, array_of_objects[i].title) || check_desc(objcheck.description, array_of_objects[i].description)) {
            return true;
        }
    }
    return false;
}

module.exports = check_plag;