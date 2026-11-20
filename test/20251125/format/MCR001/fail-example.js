const { tool, result, str, int } = require("../../../helpers/rules/mcr001-tool-naming-convention");

const R = "2025-11-25";
const amount = int("Amount in the smallest currency unit.", { minimum: 1 });
const currency = str("ISO 4217 currency code.", { pattern: "^[a-z]{3}$" });
const id = (what) => str(`Id of the ${what}.`);

const tools = [
  tool(R, "create_customer", "Creates a customer.", { email: str("Email.", { format: "email" }), name: str("Full name.") }, ["email"]),
  tool(R, "list_customers", "Lists customers.", { limit: int("Page size.", { maximum: 100 }), starting_after: id("last customer") }),
  tool(R, "create_payment_intent", "Creates a payment intent.", { amount, currency, customer: id("customer") }, ["amount", "currency"]),
  tool(R, "confirmPaymentIntent", "Confirms a payment intent.", { payment_intent: id("payment intent"), payment_method: id("payment method") }, ["payment_intent"]),
  tool(R, "capture-payment-intent", "Captures an authorized payment intent.", { payment_intent: id("payment intent"), amount_to_capture: amount }, ["payment_intent"]),
  tool(R, "cancel_payment_intent", "Cancels a payment intent.", { payment_intent: id("payment intent"), cancellation_reason: str("Reason.", { enum: ["duplicate", "fraudulent", "requested_by_customer", "abandoned"] }) }, ["payment_intent"]),
  tool(R, "create_refund", "Refunds a charge.", { charge: id("charge"), amount }, ["charge"]),
  tool(R, "CreateInvoice", "Creates a draft invoice.", { customer: id("customer"), collection_method: str("Collection method.", { enum: ["charge_automatically", "send_invoice"] }) }, ["customer"]),
  tool(R, "finalize_invoice", "Finalizes a draft invoice.", { invoice: id("invoice") }, ["invoice"]),
  tool(R, "list_invoices", "Lists invoices.", { customer: id("customer"), status: str("Status.") }),
  tool(R, "create_price", "Creates a price.", { product: id("product"), unit_amount: amount, currency, recurring: { type: ["object", "null"], properties: { interval: str("Interval.", { enum: ["day", "week", "month", "year"] }) } } }, ["product", "currency"]),
  tool(R, "create_subscription", "Creates a subscription.", { customer: id("customer"), items: { type: "array", items: { type: "object", properties: { price: id("price"), quantity: int("Quantity.") } } } }, ["customer", "items"]),
  tool(R, "update_subscription_v2", "Updates a subscription with the v2 API.", { subscription: id("subscription"), proration_behavior: str("Proration.") }, ["subscription"]),
  tool(R, "UPDATE_SUBSCRIPTION", "Updates a subscription with the legacy API.", { subscription: id("subscription") }, ["subscription"]),
  tool(R, "list_disputes", "Lists disputes.", {}),
  tool(R, "payouts.create", "Creates a payout.", { amount, currency }, ["amount", "currency"]),
  tool(R, "retrieve_balance", "Returns the account balance.", {}),
  tool(R, "search_documentation", "Searches the payments documentation.", { question: str("Question.") }, ["question"]),
  tool(R, "create_payment_link", "Creates a payment link.", { price: id("price"), quantity: int("Quantity.") }, ["price"]),
  tool(R, "create_payment_link ", "Creates a payment link (deprecated alias).", { price: id("price") }, ["price"]),
  tool(R, "create_checkout_session_\u{1F6D2}", "Creates a checkout session.", { price: id("price") }, ["price"]),
];

tools[2].execution = { taskSupport: "required" };
tools[16].icons = [{ src: "data:image/svg+xml;base64,PHN2Zy8+", mimeType: "image/svg+xml", sizes: ["16x16", "32x32"] }];

module.exports = result(R, tools, { nextCursor: "Y3VzX05mZm" });
