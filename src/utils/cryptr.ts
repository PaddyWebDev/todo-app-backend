import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.AES_KEY!, {
  encoding: "base64",
  pbkdf2Iterations: 10000,
  saltLength: 10,
});

export function encryptSocketData(data: string) {
  return cryptr.encrypt(data);
}

export function decryptSocketData(data: string) {
  return cryptr.decrypt(data);
}
