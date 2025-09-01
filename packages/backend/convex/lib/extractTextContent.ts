import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
    image: google.chat("gemini-2.5-pro"),
    pdf: google.chat("gemini-2.5-pro"),
    html: google.chat("gemini-2.5-flash")
} as const;

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
] as const;

const SYSTEM_PROMPTS = {
    image: "Convert images to text. For document photos, transcribe the content; otherwise, provide a concise description.",
    pdf: "Extract and return the text content from PDF files.",
    html: "Convert HTML content into clear, well-formatted markdown."
};

export type ExtractTextContentArgs = {
    storageId: Id<"_storage">;
    filename: string;
    bytes?: ArrayBuffer;
    mimeType: string;
};

export async function extractTextContent(
    ctx: { storage: StorageActionWriter },
    args: ExtractTextContentArgs
): Promise<string> {
    const { filename, mimeType, storageId, bytes } = args;

    const url = await ctx.storage.getUrl(storageId);
    assert(url, "Failed to get storage URL.");

    if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url);
    }
    if (mimeType.toLowerCase().includes("pdf")) {
        return extractPDFText(url, filename, mimeType);
    }
    if (mimeType.toLowerCase().includes("text")) {
        return extractTextFileConent(ctx, storageId, bytes, mimeType);
    }
    throw new Error(`Unsupported MIME type: ${mimeType}`);
}

async function extractImageText(url: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.image,
        system: SYSTEM_PROMPTS.image,
        messages: [
            {
                role: "user",
                content: [{ type: "image", image: new URL(url) }]
            }
        ]
    });
    return result.text;
}

async function extractPDFText(url: string, filename: string, mimeType: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.pdf,
        system: SYSTEM_PROMPTS.pdf,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        mimeType,
                        filename,
                        data: new URL(url)
                    },
                    {
                        type: "text",
                        text: "Extract and return only the raw text content from this PDF. Do not include any explanations or extra commentary."
                    }
                ]
            }
        ]
    });
    return result.text;
}

async function extractTextFileConent(ctx: { storage: StorageActionWriter }, storageId: Id<"_storage">, bytes: ArrayBuffer | undefined, mimeType: string): Promise<string> {
    const arrayBuffer = bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());
    if (!arrayBuffer) {
        throw new Error("Failed to get file content");
    }

    const text = new TextDecoder().decode(arrayBuffer);
    if (mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html,
            system: SYSTEM_PROMPTS.html,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text,
                        },
                        {
                            type: "text",
                            text: "Extract only the meaningful text content from this file and convert it into clear, well-structured markdown. Exclude scripts, styles, navigation, and any irrelevant boilerplate. Do not add explanations or commentary—output only the converted markdown."
                        }
                    ]
                }
            ]
        });
        return result.text;
    }
    return text;
}