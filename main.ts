/**********
 * CONSTS *
 **********/
const listSize:number = 256;
const clampingRange: number[] = [-1664, 1664]
const noiseRange: number[] = [-1,1]

/**********
 * MATRIX *
 **********/
type List = Array<number>;

type Matrix<H extends number> = [   ]

function clamp(x: number): number{
  let m = x % (Math.abs(clampingRange[0])+clampingRange[1]+1)
  if(m > clampingRange[1]){
    return m - (Math.abs(clampingRange[0])+clampingRange[1]+1)
  }
  else if(m < clampingRange[0]){
    return m + (Math.abs(clampingRange[0])+clampingRange[1]+1)
  }
  else{
    return m
  }
}

function l(n=0): List{
  return Array(listSize).fill(n);
}

function rotateRight(arr: List, n: number): List{
  // Rotates an array to the right by `n` positions, with sign changes for wrapped elements.
  let k = n % listSize
  if(k == 0){
    return arr
  }
  var res: List = Array(256).fill(0);
  let i = 0;
  while(i < listSize){
    let newPos = (i + k) % listSize
    res[newPos] = arr[i]
    if(newPos < k){
      res[newPos] = -res[newPos]  // Negate elements that wrapped around
    }
    i++;
  }
  return res
}

function multiply(a: List, b: List): List{
  // Multiplies two `listSize`-element arrays using the specified rules.
  if(a.length != listSize || b.length != listSize){ 
    console.error("Lists must have exactly " + listSize + " elements")
  }
  
  var sum: List = l();
  let i = 0;
  while(i < listSize){
    var term: List = l()
    let j = 0;
    while(j < listSize){
      term[j] = a[j] * b[i]
      j++;
    }
    let rotated = rotateRight(term, i)
    let k = 0
    while(k < listSize){
      sum[k] += clamp(rotated[k])
      k++;
    }
    i++;
  }
  let k = 0;
  while(k < listSize){
    sum[k] = clamp(sum[k])
    k++;
  }
  return sum
}


function addLists(a: List, b: List): List{
  let i = 0;
  let result: List = l();
  while(i < listSize-1){
    result[i] = clamp(a[i] + b[i])
    i++;
  }
  return result;
}

function subtractLists(a: List, b: List): List{
  let i = 0;
  let result: List = l();
  while(i < listSize-1){
    result[i] = clamp(a[i] - b[i])
    i++;
  }
  return result;
}

/********
 * KEYS *
 ********/

/***********
 * ENCRYPT *
 ***********/

/***********
 * DECRYPT *
 ***********/

/****************
 * LIST TO STRING *
 ****************/

/*********
 * KYBER *
 *********/