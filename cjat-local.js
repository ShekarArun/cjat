// titan-image-test.js
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import fs from 'fs/promises';
import path from 'path';

// Initialize Bedrock client
const client = new BedrockRuntimeClient({
    region: "us-east-1"
});

// Helper function to encode image to base64
async function imageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
}

// Helper function to save base64 image to file
async function saveBase64Image(base64String, outputPath) {
    const buffer = Buffer.from(base64String, 'base64');
    await fs.writeFile(outputPath, buffer);
    console.log(`Image saved to: ${outputPath}`);
}

// 1. Text-to-Image Generation
async function generateImageFromText(prompt, outputPath) {
    const params = {
        modelId: "amazon.titan-image-generator-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            taskType: "TEXT_IMAGE",
            textToImageParams: {
                text: prompt
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 1024,
                width: 1024,
                cfgScale: 8.0,
                seed: 42
            }
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.images && responseBody.images.length > 0) {
            await saveBase64Image(responseBody.images[0], outputPath);
            return responseBody;
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}

// 2. Image Editing (Inpainting with mask)
async function editImageWithMask(imagePath, maskPath, prompt, outputPath) {
    const imageBase64 = await imageToBase64(imagePath);
    const maskBase64 = await imageToBase64(maskPath);

    const params = {
        modelId: "amazon.titan-image-generator-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            taskType: "INPAINTING",
            inPaintingParams: {
                text: prompt,
                image: imageBase64,
                maskImage: maskBase64
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 1024,
                width: 1024,
                cfgScale: 8.0
            }
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.images && responseBody.images.length > 0) {
            await saveBase64Image(responseBody.images[0], outputPath);
            return responseBody;
        }
    } catch (error) {
        console.error("Error editing image:", error);
        throw error;
    }
}

// 3. Image Variation (using reference image)
async function createImageVariation(imagePath, prompt, outputPath) {
    const imageBase64 = await imageToBase64(imagePath);

    const params = {
        modelId: "amazon.titan-image-generator-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            taskType: "IMAGE_VARIATION",
            imageVariationParams: {
                text: prompt,
                images: [imageBase64]
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 1024,
                width: 1024,
                cfgScale: 8.0
            }
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.images && responseBody.images.length > 0) {
            await saveBase64Image(responseBody.images[0], outputPath);
            return responseBody;
        }
    } catch (error) {
        console.error("Error creating variation:", error);
        throw error;
    }
}

// 4. Outpainting (extend image)
async function extendImage(imagePath, maskPath, prompt, outputPath) {
    const imageBase64 = await imageToBase64(imagePath);
    const maskBase64 = await imageToBase64(maskPath);

    const params = {
        modelId: "amazon.titan-image-generator-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            taskType: "OUTPAINTING",
            outPaintingParams: {
                text: prompt,
                image: imageBase64,
                maskImage: maskBase64
            },
            imageGenerationConfig: {
                numberOfImages: 1,
                height: 1024,
                width: 1024,
                cfgScale: 8.0
            }
        })
    };

    try {
        const command = new InvokeModelCommand(params);
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        if (responseBody.images && responseBody.images.length > 0) {
            await saveBase64Image(responseBody.images[0], outputPath);
            return responseBody;
        }
    } catch (error) {
        console.error("Error extending image:", error);
        throw error;
    }
}

// Main execution
async function main() {
    console.log("Testing Amazon Titan Image Generator...\n");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Test 1: Text to Image
    console.log("1. Generating image from text...");
    const outputPath = path.join("./output", `text-to-image-${timestamp}.png`);
    await generateImageFromText(
        "A serene mountain landscape at sunset with a lake in the foreground",
        outputPath
    );

    // // Test 2: Image Variation (if you have a source image)
    // // Uncomment if you have a source image
    // console.log("\n2. Creating image variation...");
    // const outputPathImageVariation = path.join("./output", `image-variation-${timestamp}.png`);
    // await createImageVariation(
    //     "./input/GreyBlazer2_PP.png",
    //     "Make the subject person wear a red shirt",
    //     outputPathImageVariation
    // );

    // Test 3: Inpainting (if you have source and mask images)
    // Uncomment if you have source and mask
    /*
    console.log("\n3. Editing image with mask...");
    await editImageWithMask(
        "./input/source.jpg",
        "./input/mask.png",
        "Replace with a red sports car",
        "./output/edited.png"
    );
    */

    console.log("\nAll tests completed!");
}

// Run the script
main().catch(console.error);