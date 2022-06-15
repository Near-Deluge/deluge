import React, { Component } from "react";
import { CIDString, Filelike, Web3Response, Web3Storage } from "web3.storage";

export default class Storage {
  apiKey: string = "";
  instance?: Web3Storage;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.instance = new Web3Storage({ token: apiKey });
  }

  isInstanceInitialized() {
    if (this.instance instanceof Web3Storage) return true;
    else {
      throw "Instance not Initialized!!!";
    }
  }

  async getFirstFile(cid: CIDString) {
    if (this.isInstanceInitialized()) {
      const res: Web3Response | null | undefined = await this.instance?.get(
        cid
      );

      // console.log(await res?.files());

      if (res && res.ok) {
        const files = await res?.files();
        return files[0];
      } else {
        return null;
      }
    }
  }

  async putJSONFile(json: JSON, fileName: string) {
    if (this.isInstanceInitialized()) {
      const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const files = [new File([blob], fileName)];
      const cid = await this.instance?.put(files);
      if (cid) return cid;
      else return null;
    }
  }

  async putFile(file: Filelike) {
    if (this.isInstanceInitialized()) {
      const files = [file];
      const cid = await this.instance?.put(files);
      if (cid) return cid;
      else return null;
    }
  }

  async putFiles(files: FileList) {
    if (this.isInstanceInitialized()) {
      const cid = await this.instance?.put(files);
      if (cid) return cid;
      else return null;
    }
  }
}
