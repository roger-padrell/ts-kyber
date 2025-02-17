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

type Matrix = List[]

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

function l(v:number=0): List{
  return Array(listSize).fill(v);
}

function mtx(h: number, v: number=0): Matrix{
  return Array(h).fill(l(v));
}

function rotateRight(arr: List, n: number): List{
  // Rotates an array to the right by `n` positions, with sign changes for wrapped elements.
  let k = n % listSize
  if(k == 0){
    return arr
  }
  let res: List = Array(256).fill(0);
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
  
  let sum: List = l();
  let i = 0;
  while(i < listSize){
    let term: List = l()
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

function rand(n: number, m: number){
  return Math.floor(Math.random() * (m-n+1)) + n 
}

function generateSignalSecret(): Matrix{
  let m: Matrix = mtx(2);
  let r = 0;
  let c = 0;
  while(r < 2){
    c=0
    while(c < listSize){
      m[r][c] = rand(noiseRange[0],noiseRange[1]);
      c = c+1;
    }
    r = r+1;
  }
  return m;
}

function generateNoiseSecret(): Matrix{
  let m: Matrix = mtx(2);
  let r = 0;
  let c = 0;
  while(r < 2){
    c=0
    while(c < listSize){
      m[r][c] = rand(noiseRange[0],noiseRange[1]);
      c = c+1;
    }
    r = r+1;
  }
  return m;
}

function generatePublicTable(): Matrix{ 
  let m: Matrix = mtx(4);
  let r = 0;
  let c = 0;
  while(r < 4){
    c=0;
    while(c < listSize){
      m[r][c] = rand(noiseRange[0],noiseRange[1]);
      c = c+1;
    }
    r = r+1;
  }
  return m;
}


function generatePublicKey(table: Matrix, signal_secret: Matrix, noise_secret: Matrix): [List, List]{
  // Generates the public key pair using the given table, signal secret, and noise secret.
  let term1 = multiply(table[0],signal_secret[0])
  let term2 = multiply(table[1], signal_secret[1])
  let sumTerms1 = addLists(term1,term2)
  let public1 = addLists(sumTerms1,noise_secret[0])
  
  let term3 = multiply(table[2], signal_secret[0])
  let term4 = multiply(table[3], signal_secret[1])
  let sumTerms2 = addLists(term3, term4)
  let public2 = addLists(sumTerms2, noise_secret[1])
  
  return [public1, public2]
}

/***********
 * ENCRYPT *
 ***********/

function generateSenderSignalSecret(): Matrix{ 
  var m: Matrix = mtx(2);
  var r = 0;
  var c = 0;
  while(r < 2){
    c=0;
    while(c < listSize){
      m[r][c] = rand(noiseRange[0],noiseRange[1]);
      c = c+1;
    }
    r = r+1;
  }
  return m;
}

function generateSenderNoiseSecret(): Matrix{ 
  var m: Matrix = mtx(2);
  var r = 0;
  var c = 0;
  while(r < 2){
    c=0;
    while(c < listSize){
      m[r][c] = rand(noiseRange[0],noiseRange[1]);
      c = c+1;
    }
    r = r+1;
  }
  return m;
}

function generateSenderEncryptionKey(table: Matrix, signal_secret: Matrix, noise_secret: Matrix): [List, List]{
  // Generates the public key pair using the given table, signal secret, and noise secret.
  let term1 = multiply(table[0], signal_secret[0])
  let term2 = multiply(table[2], signal_secret[1])
  let sumTerms1 = addLists(term1, term2)
  let public1 = addLists(sumTerms1, noise_secret[0])
  
  let term3 = multiply(table[1], signal_secret[0])
  let term4 = multiply(table[3], signal_secret[1])
  let sumTerms2 = addLists(term3, term4)
  let public2 = addLists(sumTerms2, noise_secret[1])
  
  return [public1, public2]
}

function encryptMessage(message: List, signalSecret: Matrix, reciverPublicKey: [List,List]): List{
    let term1 = multiply(signalSecret[0], reciverPublicKey[0]);
    let term2 = multiply(signalSecret[1], reciverPublicKey[1]);
    let sumTerms1 = addLists(term1, term2)
    let encrypted = addLists(sumTerms1, message);
    return encrypted
}

/***********
 * DECRYPT *
 ***********/

function inRng(v: number, x: number, y: number): boolean{
  if(v <= y && v >= x){
    return true;
  }
  else{
    return false;
  }
}

function bigOrSmall(noisedMessage: List): List{ 
    var message = noisedMessage;
    var n = 0;
    let smallRange:[number,number] = [Math.floor(clampingRange[0]/2), 0 - Math.floor(clampingRange[0]/2)]
    while(n < message.length){
        if(inRng(message[n], smallRange[0], smallRange[1])){
            message[n] = 0;
        }
        else{
            message[n] = clampingRange[0];
        }
        n = n + 1;
    }
    return message;
}

function decrypt(encrypted: List, senderKeys: [List, List], signalSecret: Matrix): List{
    let term1 = multiply(senderKeys[0], signalSecret[0]);
    let term2 = multiply(senderKeys[1], signalSecret[1]);
    let noisedMessage = subtractLists(subtractLists(encrypted, term1), term2);

    let message = bigOrSmall(noisedMessage);
    return message;
}

/****************
 * LIST TO STRING *
 ****************/

/*********
 * KYBER *
 *********/

/***********
 * EXPORTS *
 ***********/