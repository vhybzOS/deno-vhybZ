import { Prompt, PromptProvider } from './types';
import mustache from 'mustache';
import { extname, basename } from "https://deno.land/std@0.224.0/path/mod.ts";
import { sleep } from '../utils';

const PROMPTS_PATH = "./prompts"

const promptMap: Map<string, string> = new Map()
let ready = false

export async function loadMarkdown(name: string): Promise<string> {
  while (!ready) {
    await sleep(100)
  }
  const filePath = promptMap[name];
  if (!filePath) {
    throw Error("prompt file does not exist")
  }

  return await readTextFile(filePath)
}

export async function renderTemplate(name: string, params: Record<string, any>): Promise<string> {
  const template = await loadMarkdown(name)
  return mustache.render(template, params)
}

export const makePrompt: PromptProvider = (name: string) => {
  return (params?: Record<string, any>) => { return renderTemplate(name, params || {}) }
}

export async function getPrompt(promptFn: Prompt, params?: Record<string, any>): Promise<string> {
  if (typeof promptFn === "string") {
    return promptFn
  }
  return await promptFn(params)
}


/**
 * Lists all Markdown (.md) files in a given directory and creates a map
 * where keys are filenames without extensions and values are their full paths.
 *
 * @param dirPath The path to the directory to scan.
 * @returns A Promise that resolves to a Map<string, string> where:
 * - Keys: Filenames without the .md extension.
 * - Values: The full path to the Markdown file.
 * @throws Deno.errors.NotFound if the directory does not exist.
 * @throws Deno.errors.PermissionDenied if read permission is not granted.
 */
async function listMarkdownFilesAsMap(dirPath: string): Promise<Map<string, string>> {

  try {
    for await (const dirEntry of Deno.readDir(dirPath)) {
      if (dirEntry.isFile) {
        const fullPath = `${dirPath}/${dirEntry.name}`;
        const extension = extname(fullPath);

        if (extension === ".md") {
          const fileNameWithoutExt = basename(dirEntry.name, ".md");
          promptMap.set(fileNameWithoutExt, fullPath);
        }
      }
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: Directory not found at ${dirPath}`);
      throw error;
    } else if (error instanceof Deno.errors.PermissionDenied) {
      console.error(`Error: Permission denied to read directory ${dirPath}. Make sure to run with --allow-read.`);
      throw error;
    } else {
      console.error(`An unexpected error occurred while listing files in ${dirPath}:`, error);
      throw error;
    }
  }
  ready = true
  return promptMap;
}

/**
 * Reads the content of a text file.
 * @param filePath The path to the text file.
 * @returns A promise that resolves with the content of the file as a string.
 * @throws Deno.errors.NotFound if the file does not exist.
 * @throws Deno.errors.PermissionDenied if read permission is not granted.
 */
async function readTextFile(filePath: string): Promise<string> {
  try {
    const content = await Deno.readTextFile(filePath);
    return content;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(`Error: File not found at ${filePath}`);
      throw error; // Re-throw the error after logging
    } else if (error instanceof Deno.errors.PermissionDenied) {
      console.error(`Error: Permission denied to read ${filePath}. Make sure to run with --allow-read.`);
      throw error; // Re-throw the error after logging
    } else {
      console.error(`An unexpected error occurred while reading ${filePath}:`, error);
      throw error; // Re-throw any other errors
    }
  }
}

listMarkdownFilesAsMap(PROMPTS_PATH)



