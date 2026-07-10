import { Flag } from "./types";

export function buildNegotiationMessageClient(
  flags: Flag[],
  tone: "Friendly" | "Firm" | "Professional" = "Professional"
): string {
  const issues = [...flags.filter((f) => f.severity === "red"), ...flags.filter((f) => f.severity === "yellow")]
    .slice(0, 4)
    .map((f) => `• ${f.category}`)
    .join("\n");

  const bulletBlock = issues || "• A few contract terms";

  if (tone === "Friendly") {
    return `Hey! 😊 Thanks so much for sending over the contract — I'm really excited about this collab!\n\nI gave it a read and had a couple small things I wanted to chat about before signing:\n\n${bulletBlock}\n\nI've got some suggested tweaks for each of these that I think would work well for both of us — happy to hop on a quick call whenever works for you!\n\nLooking forward to it!`;
  }

  if (tone === "Firm") {
    return `Hi,\n\nThank you for the contract. Before I can sign, the following terms need to be revised:\n\n${bulletBlock}\n\nI've outlined fair, industry-standard counter-language for each clause. These changes are necessary for me to move forward with this partnership. Please confirm you're able to accommodate these revisions, and I'll have the signed agreement back to you promptly.\n\nLooking forward to your response.`;
  }

  return `Hi [Brand Contact],\n\nThank you for sending over the collaboration agreement — I'm excited about this partnership and want to make sure we're set up for a smooth campaign.\n\nAfter reviewing the contract, I'd love to discuss a few points before signing:\n\n${bulletBlock}\n\nI've prepared suggested counter-language for each of these clauses that I believe creates a fairer foundation for both of us. I'd be happy to jump on a quick call to walk through them together.\n\nLooking forward to making this work!\n\n[Your Name]`;
}
