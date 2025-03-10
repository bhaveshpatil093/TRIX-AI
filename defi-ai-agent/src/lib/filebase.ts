"use server"
import { FilebaseClient } from "@filebase/client";

const GATEWAY = "ipfs.filebase.io";
const filebaseClientImage = new FilebaseClient({
    token: process.env.FILEBASE_API_KEY
});

export const uploadImageToIPFS = async (fileBuffer: Buffer | string): Promise<string | null> => {
    try {

        const content = new Blob([fileBuffer]);
        const cid = await filebaseClientImage.storeBlob(content);

        const imageUrlOnIPFS = `https://${GATEWAY}/ipfs/${cid}`;
        console.log("Uploaded Image IPFS URL:", imageUrlOnIPFS);
        return imageUrlOnIPFS;
    } catch (error) {
        console.error("Error uploading image to IPFS:", error);
        return null;
    }
};


