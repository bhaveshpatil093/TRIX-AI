/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { uploadImageToIPFS } from '@/lib/filebase';
import axios from 'axios';

interface GenerateImageResponse {
    nftIpfsUrl: string;
    img: string;
}

export const generateImage = async (prompt: string): Promise<GenerateImageResponse | null> => {
    const apiUrl = process.env.VENICE_API_BASE_URL;
    const apiKey = process.env.VENICE_API_KEY;

    if (!apiKey || !apiUrl) {
        console.error("Error: Venice API key or URL is missing.");
        throw new Error("Venice API key or URL is missing.");
    }

    const requestBody = {
        model_name: "SDXL1.0-base",
        prompt,
        height: 1024,
        width: 1024,
        backend: "auto"
    };

    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.data?.images || !response.data.images[0]?.image) {
            console.error("Error: No valid image data received from API", response.data);
            return null;
        }

        const base64Image = response.data.images[0].image;
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // Upload image to IPFS
        const ipfsUrl = await uploadImageToIPFS(imageBuffer);
        if (!ipfsUrl) {
            console.error("Error: Image upload to IPFS failed.");
            return null;
        }

        // NFT metadata object
        const nftMetadata = {
            name: "AI-NFT",
            image: ipfsUrl,
            attributes: [
                {
                    "trait_type": "Type",
                    "value": "AI Minted NFT"
                }
            ]
        };

        // console.log("NFT Metadata:", nftMetadata);

        // Upload NFT metadata to IPFS
        const nftObjBuffer = JSON.stringify(nftMetadata);
        const nftIpfsUrl = await uploadImageToIPFS(nftObjBuffer);
        if (!nftIpfsUrl) {
            console.error("Error: NFT metadata upload to IPFS failed.");
            return null;
        }

        return {
            nftIpfsUrl,
            img: ipfsUrl
        };

    } catch (error: any) {
        console.error("Error generating image:", error.response?.data || error.message);
        throw new Error("Failed to generate image. Please try again later.");
    }
};
