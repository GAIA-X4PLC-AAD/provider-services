export const schema = {
  type: "object",
  patternProperties: {
    "^[a-zA-Z_]+$": { // folder name (file type)
      type: "object",
      patternProperties: {
        "^[a-zA-Z_]+$": { // script name
          type: "object",
          patternProperties: {
            "^[a-zA-Z_]+$": { // attribute name
              type: "object",
              properties: {
                "@type": { 
                  type: "string", 
                  enum: ["text", "number"] 
                }, // attribute's property
                "@description": { 
                  type: "string" 
                }, // attribute's property
                "@min": {  // attribute's property
                  type: "string", // or "number" depending on the expected value type
                  pattern: "^[0-9]+$"  // pattern for a string of numeric characters
                }
              },
              required: ["@type", "@description"],
              additionalProperties: false
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};
