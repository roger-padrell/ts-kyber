/**********
 * CONSTS *
 **********/
const listSize:number = 256;
const clampingRange: number[] = [-1664, 1664]
const noiseRange: number[] = [-1,1]
const maxStrLen = Math.floor(listSize/8);

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

function initList(v:number=0): List{
  return Array(listSize).fill(v);
}

function mtx(h: number, v: number=0): Matrix{
  return Array(h).fill(initList(v));
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
  
  let sum: List = initList();
  let i = 0;
  while(i < listSize){
    let term: List = initList()
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
  let result: List = initList();
  while(i < listSize-1){
    result[i] = clamp(a[i] + b[i])
    i++;
  }
  return result;
}

function subtractLists(a: List, b: List): List{
  let i = 0;
  let result: List = initList();
  while(i < listSize-1){
    result[i] = clamp(a[i] - b[i])
    i++;
  }
  return result;
}

function parseMatrix(size: number, fromString: string): Matrix{ 
  var splitted = fromString.split(",");
  var res: Matrix = mtx(size);
  var n = 0;
  var list = 0;
  var item = 0;
  while(n<splitted.length){
    var replaced = splitted[n].replace("[","").replace("]","").replace("(","").replace(")","").replace(" ","")
    res[list][item] = parseInt(replaced);

    // Change list, item and n
    n = n + 1;
    item = n % listSize;
    list = Math.floor((n - item) / listSize);
  }
  return res;
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

function encryptMessage(message: List, signalSecret: Matrix, reciverPublicKey: [List,List]): Matrix{
    let term1 = multiply(signalSecret[0], reciverPublicKey[0]);
    let term2 = multiply(signalSecret[1], reciverPublicKey[1]);
    let sumTerms1 = addLists(term1, term2)
    let encrypted = addLists(sumTerms1, message);
    return [encrypted]
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

function decrypt(encrypted: Matrix, senderKeys: [List, List], signalSecret: Matrix): List{
    let term1 = multiply(senderKeys[0], signalSecret[0]);
    let term2 = multiply(senderKeys[1], signalSecret[1]);
    let noisedMessage = subtractLists(subtractLists(encrypted[0], term1), term2);

    let message = bigOrSmall(noisedMessage);
    return message;
}

/****************
 * LIST and STRING *
 ****************/

function stringToBinary(text: string): string{
  var length = text.length,
      output = [];
  for (var i = 0;i < length; i++) {
    var bin = text[i].charCodeAt(0).toString(2);
    output.push(Array(8-bin.length+1).join("0") + bin);
  } 
  return output.join("");
}

function stringToList(s: string): List{
  if(s.length > maxStrLen){
    console.error("Message strings can only be up to " + maxStrLen + " characters")
    return initList()
  } 
  var l: List = initList();
  let bin = stringToBinary(s);
  var n = 0;
  if(s.length > listSize){
      console.error("Message strings can only be up to " + maxStrLen + " characters")
      return initList()
  }
  while(n < bin.length){
    l[n] = parseInt(bin[n]) * clampingRange[0]
    n = n + 1;
  }
  return l;
}

function parsedBinaryToString(str: string): string{
  let binString = '';

  str.split(' ').map(function(bin) {
      binString += String.fromCharCode(parseInt(bin, 2));
    });
  return binString;
}

function binaryToString(input: string): string{
  let r: string = "";
  let n = 0;
  while ((n < input.length) && (input.length-n > 7)){
    let sliced = input.slice(n, n+8)
    if(sliced == "00000000" || sliced == "11111111"){
      break;
    }
    r = r + sliced + " ";
    n = n + 8;
  }
  // remove last space
  r = r.slice(0,r.length-1);
  //to string from parsed bin
  r = parsedBinaryToString(r);
  return r;
}

function listToString(l: List): string{
  let str = l.join("")
  str = str.replaceAll(String(clampingRange[0]),"1")
  return binaryToString(str);
}

/*********
 * KYBER *
 *********/

type Kyber = {
  signalSecret: Matrix,
  publicTable: Matrix,
  noiseSecret: Matrix,
  publicKeys: [List, List]
}

type Message = {
  encryptedMessage: Matrix,
  senderPublicKeys: [List, List]
}
    
type KyberSender = {
  signalSecret: Matrix,
  publicTable: Matrix,
  noiseSecret: Matrix,
  reciverPublicKeys: [List, List],
  senderPublicKeys: [List, List]
}

type PublicKyber = {
  publicTable: Matrix,
  publicKeys: [List,List]
}

export function createKyberFrom(publicTable: Matrix, signalSecret: Matrix, noiseSecret: Matrix): Kyber{
  let publicKeys = generatePublicKey(publicTable, signalSecret, noiseSecret);
  var k: Kyber = {noiseSecret, signalSecret, publicTable, publicKeys };
  return k;
}

export function createRandomKyber(): Kyber{
  var k: Kyber = createKyberFrom(generatePublicTable(), generateSignalSecret(), generateNoiseSecret());
  return k;
}

export function createMessageSender(publicTable: Matrix, reciverPublicKeys: [List, List]): KyberSender{
  let noiseSecret = generateSenderNoiseSecret();
  let signalSecret = generateSenderSignalSecret();
  let senderPublicKeys = generateSenderEncryptionKey(publicTable, signalSecret, noiseSecret)
  var k: KyberSender = {publicTable, reciverPublicKeys, noiseSecret, signalSecret, senderPublicKeys};
  return k;
}

export function sendMessage(k: KyberSender, message: List): Message {
  let encryptedMessage = encryptMessage(message, k.signalSecret, k.reciverPublicKeys);
  let m: Message = {encryptedMessage: encryptedMessage, senderPublicKeys: k.senderPublicKeys}
  return m;
}

export function sendString(k: KyberSender, mess: string): Message{
  var message: List = stringToList(mess)
  if(message == initList()){
    console.warn("Message is blank, maybe some error expressed previously")
    return {encryptedMessage: [initList()], senderPublicKeys: [initList(),initList()]};
  }
  var m: Message = {encryptedMessage: encryptMessage(message, k.signalSecret, k.reciverPublicKeys), senderPublicKeys: k.senderPublicKeys};
  return m;
}

export function recieveMessage(k: Kyber, m: Message): List{ 
  return decrypt(m.encryptedMessage, m.senderPublicKeys, k.signalSecret)
}

export function recieveString(k: Kyber, me: Message): string {
  let m = recieveMessage(k, me)
  return listToString(m);
}

// Exporting
export function  toPublic(k: Kyber): PublicKyber{
  var p: PublicKyber = {publicKeys: k.publicKeys, publicTable: k.publicTable};
  return p;
}

export function publicString(p: PublicKyber): string{
  let publicKeys = JSON.stringify(p.publicKeys);
  let parr = publicKeys.split("")
  parr[0] = "(";
  parr[parr.length-1] = ")";
  publicKeys = parr.join("")
  var str = {publicTable: JSON.stringify(p.publicTable), publicKeys}
  return JSON.stringify(str);
}

export function exportFullKyber(k: Kyber): string{
  let publicKeys = JSON.stringify(k.publicKeys);
  let parr = publicKeys.split("")
  parr[0] = "(";
  parr[parr.length-1] = ")";
  publicKeys = parr.join("")
  var str = {signalSecret: JSON.stringify(k.signalSecret), publicTable: JSON.stringify(k.publicTable), noiseSecret: JSON.stringify(k.noiseSecret), publicKeys}
  return JSON.stringify(str);
}

export function exportMessage(m: Message): string{
  let publicKeys = JSON.stringify(m.senderPublicKeys);
  let parr = publicKeys.split("")
  parr[0] = "(";
  parr[parr.length-1] = ")";
  publicKeys = parr.join("")
  var str = {encryptedMessage: JSON.stringify(m.encryptedMessage), senderPublicKeys: publicKeys}
  return JSON.stringify(str);
}

// Importing
export function importPublicKyber(s: string): PublicKyber{ 
  var js = JSON.parse(s);
  let publicTable = parseMatrix(4, js.publicTable);
  let publicKeyStr = js.publicKeys;
  let parr = publicKeyStr.split("")
  parr[0] = "[";
  parr[parr.length-1] = "]";
  publicKeyStr = parr.join("")
  var pKeys: Matrix = parseMatrix(2, publicKeyStr)
  let publicKeys: [List, List] = [pKeys[0], pKeys[1]]
  var pk: PublicKyber = {publicKeys, publicTable};
  return pk;
};

export function importFullKyber(s: string): Kyber{
  var js = JSON.parse(s);
  let publicTable = parseMatrix(4, js.publicTable);
  let noiseSecret = parseMatrix(4, js.noiseSecret);
  let signalSecret = parseMatrix(4, js.signalSecret);
  let publicKeyStr = js.publicKeys;
  let parr = publicKeyStr.split("")
  parr[0] = "[";
  parr[parr.length-1] = "]";
  publicKeyStr = parr.join("")
  var pKeys: Matrix = parseMatrix(2, publicKeyStr)
  let publicKeys: [List, List] = [pKeys[0], pKeys[1]]
  var pk: Kyber = {publicKeys, publicTable, noiseSecret, signalSecret};
  return pk;
}

export function importMessage(s: string): Message{
  var js = JSON.parse(s);
  let encryptedMessage = parseMatrix(1, js.encryptedMessage);
  let publicKeyStr = js.senderPublicKeys;
  let parr = publicKeyStr.split("")
  parr[0] = "[";
  parr[parr.length-1] = "]";
  publicKeyStr = parr.join("")
  var pKeys: Matrix = parseMatrix(2, publicKeyStr)
  let publicKeys: [List, List] = [pKeys[0], pKeys[1]]
  var pk: Message = {encryptedMessage, senderPublicKeys: publicKeys};
  return pk;
}

/***********
 * EXPORTS *
 ***********/

export type { Kyber, Message, KyberSender, PublicKyber}