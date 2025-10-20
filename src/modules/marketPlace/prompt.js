import { categories } from "./create-product";

export function getProductAIPrompt(name) {
  return `Generate a 350-letter engaging product description for an online marketplace. Product title: "${name}". Suggest the best category from this list: ${categories
    .map((c) => c.label)
    .join(", ")}. Return the result as:\nDescription: ...\nCategory: ...`;
}
