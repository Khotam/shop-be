export default {
  type: "object",
  properties: {
    title: { type: "string", minLength: 3 },
    description: { type: "string", minLength: 3 },
    price: { type: "number", minimum: 0 },
    count: { type: "number", minimum: 0 },
  },
  required: ["title", "price", "count"],
} as const;
