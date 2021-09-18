function valiNumber(val) {
  let num = 0;
  for (let c of String(val)) {
    if (c === '.') num++;
  }
  if(num>1){
    return 0
  }else if(num === 1 && String(val).slice(-1) === '.'){
    return 1
  }else if(val === 0 ){
    return 2
  }else{
    let reg = /^[1-9]\d*\,\d*|[1-9]\d*$/;
    let state = reg.test(Number(val))?2:0
    return state
  }
  
}

export {
  valiNumber
}