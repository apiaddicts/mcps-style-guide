const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-11-25";
const amount = int("Amount in the smallest currency unit.");
const id = (what) => str(`Id of the ${what}.`);

const tools = [
  tool(R, "create_customer", "Creates a customer.", { email: str("Email."), name: str("Full name, e.g. \"Jane-Doe\".") }, ["email"]),
  tool(R, "list_customers", "Lists customers.", {}),
  tool(R, "create_payment_intent", "Creates a payment intent.", { amount, currency: str("Currency.") }, ["amount", "currency"]),
  tool(R, "confirm_payment_intent", "Confirms a payment intent.", { payment_intent: id("payment intent") }, ["payment_intent"]),
  tool(R, "capture_payment_intent", "Captures a payment intent.", { payment_intent: id("payment intent") }, ["payment_intent"]),
  tool(R, "cancel_payment_intent", "Cancels a payment intent.", { payment_intent: id("payment intent") }, ["payment_intent"]),
  tool(R, "create_refund", "Refunds a charge.", { charge: id("charge"), amount }, ["charge"]),
  tool(R, "create_invoice", "Creates an invoice.", { customer: id("customer") }, ["customer"]),
  tool(R, "finalize_invoice", "Finalizes an invoice.", { invoice: id("invoice") }, ["invoice"]),
  tool(R, "list_invoices", "Lists invoices.", {}),
  tool(R, "create_price", "Creates a price.", { product: id("product"), unit_amount: amount }, ["product"]),
  tool(R, "create_subscription", "Creates a subscription.", { customer: id("customer") }, ["customer"]),
  tool(R, "update_subscription_v2", "Updates a subscription.", { subscription: id("subscription") }, ["subscription"]),
  tool(R, "list_disputes", "Lists disputes.", {}),
  tool(R, "create_payout", "Creates a payout.", { amount }, ["amount"]),
  tool(R, "retrieve_balance", "Returns the balance.", {}),
  tool(R, "search_documentation", "Searches the docs.", { question: str("Question.") }, ["question"]),
  tool(R, "create_payment_link", "Creates a payment link.", { price: id("price") }, ["price"]),
  tool(R, "create_checkout_session", "Creates a checkout session.", { price: id("price") }, ["price"]),
  tool(R, "ping", "Health check.", {}),
];

tools[0].inputSchema.$schema = "http://json-schema.org/draft-07/schema#";
tools[1].inputSchema = { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object", additionalProperties: false };
tools[2].inputSchema.$defs = { Money: { type: "object", properties: { name: { const: "Money-Name" } } } };
tools[3].execution = { taskSupport: "required" };
tools[19].icons = [];

module.exports = result(R, tools);
