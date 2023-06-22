import { mongooseConnection } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { buffer } from "micro";

const stripe = require('stripe')('sk_test_...');

const endpointSecret = "whsec_5bbd99d1800def046182a6c9fd031fc7a5e0a723090bec5fd9a1b9a2e36ba622";

export default async function handler(req, res) {
    await mongooseConnection();
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(await buffer(req), sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const data = event.data.object;
            const orderId = data.metadata.orderId;
            const paid = data.payment_status === 'paid';
            if (orderId && paid) {
                Order.findByIdAndUpdate(orderId, {
                    paid: true,
                });
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('ok');
}

export const config = {
    api: { bodyParser: false, },
};

// grin-lead-catchy-warmly something key(maybe)
// acct_1NDXizCzPnYaCcRP id
// whsec_5bbd99d1800def046182a6c9fd031fc7a5e0a723090bec5fd9a1b9a2e36ba622