function id_checker(ids_array, id_to_enter) {
    let flag = true;
    for(let i = 0; i < ids_array.length; i++) {
        if(ids_array[i].id_o === id_to_enter) {
            flag = false;
            break;
        }
    }
    return flag;
}

module.exports = id_checker;