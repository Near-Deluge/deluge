import { FileObject } from "files-from-path";
import { Blob } from "node:buffer";
import { CIDString, File, Filelike, Web3File, Web3Storage } from "web3.storage";

export class BaseAPI {
  connection: null | Web3Storage = null;
  apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5RGJmYjE1NzhCYTE5NTJDMkJmMDYyN2VFOThiNUYwOTliMjVGM0EiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDk2NzAzMDgyODAsIm5hbWUiOiJEZWx1Z2UifQ.VrlPfPIJVvhCTxyjv40k3aLcTNtRaVUDoyjtP34CXb0";

  constructor() {
    this.connection = new Web3Storage({ token: this.apiKey });
  }

  // Method to upload only one file
  // Returns: CID of uploaded file
  async uploadFile(files: Filelike) {
    return await this.connection?.put([files]);
  }

  // Method to get any CID
  // Returns: Files of the CID from the Storage Car
  async getFile(cid: CIDString) {
    const res = await this.connection?.get(cid); // Web3Response
    const files = await res?.files(); // Web3File[]
    return files;
  }

  // Method to return Status for any CID
  // Returns: Status for any CID
  async getStatus(cid: CIDString) {
    return this.connection?.status(cid);
  }

  // Method to return All Uploads
  // Returns: List for all Uploads
  async getListUploads(limit: Number) {
    return await this.connection?.list({ maxResults: 10 });
  }

  // Method to convert JSON file to BLOB type
  // Return a Filelike for JSON Object
  getFileFromJSON(object: any, fileName: String) {
    return new File([JSON.stringify(object)], fileName.toString());
  }

  // Parse Object
  // Return Parsed JSON Object from File
  async getJSONFromFile(file: any) {
    return JSON.parse(await file.text());
  }
}
