import { assertEquals } from "jsr:@std/assert";
import * as k from "./main.ts"

Deno.test("Encryption and decryption test", () => {
    var bk: k.Kyber = k.createRandomKyber();
    var bs: k.KyberSender = k.createMessageSender(bk.publicTable, bk.publicKeys);

    var m: k.Message = k.sendString(bs, "Hello");

    var res =  k.recieveString(bk,m) 
    assertEquals(res, "Hello");
  });