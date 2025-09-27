const User = require("../models/User")
const axios = require("axios");

const createPayment = async (req, res) => {
    const { offer, userId } = req.body;
    console.log("Requête reçue:", req.body);

    if (!offer || !userId) {
        return res.status(400).json({ message: "Offre et utilisateur requis" });
    }

    const user = await User.findById(userId);

    try {
        // Exemple config CinetPay
        const payload = {
            apikey: process.env.CINETPAY_API_KEY,
            site_id: process.env.CINETPAY_SITE_ID,
            // unique
            transaction_id: `${userId}-${offer.type}-${Date.now()}`,
            amount: offer.price,
            currency: "XOF",
            description: `Abonnement ${offer.title} (${offer.duration})`,
            // ton front
            return_url: `${process.env.BASE_URL}/payment/success`,
            // callback backend
            notify_url: `${process.env.BASE_URL}/payment/notify`,
            customer_id: userId,
            // tu peux utiliser user.username
            customer_name: user.username,
            customer_email: user.email,
            //   customer_email: "test@email.com",
            //   customer_name: "Abonné",
        };

        console.log("Payload envoyé à CinetPay:", payload);

        // Appel API CinetPay
        const response = await axios.post(
            "https://api-checkout.cinetpay.com/v2/payment",
            payload
        );

        if (response.data.code === "201") {
            // Retourne le lien de paiement
            return res.json({ payment_url: response.data.data.payment_url });
        } else {
            return res.status(500).json({ message: "Erreur CinetPay", data: response.data });
        }
    } catch (error) {
        console.error("Erreur CinetPay:", error.response?.data || error.message);
        res.status(500).json({ message: "Impossible de créer le paiement" });
    }
};

const notifyPayment = async (req, res) => {
    try {
        const { transaction_id, status, amount } = req.body;

        if (status === "ACCEPTED") {
            const [userId, offerType] = transaction_id.split("-"); 
            // transaction_id = "userid-weekly-173000000"

            const now = new Date();
            let subscriptionEnd;

            switch (offerType) {
                case "weekly":
                subscriptionEnd = new Date(now.setDate(now.getDate() + 7));
                break;
                case "monthly":
                subscriptionEnd = new Date(now.setMonth(now.getMonth() + 1));
                break;
                case "yearly":
                subscriptionEnd = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
                default:
                subscriptionEnd = null;
            }

            await User.findByIdAndUpdate(userId, {
                subscription: offerType,
                subscriptionStart: new Date(),
                subscriptionEnd,
                lastPaymentId: transaction_id,
                lastPaymentAmount: amount,
                lastPaymentDate: new Date(),
            });

            return res.status(200).json({ 
                message: `Paiement validé, abonnement ${offerType} actif jusqu’au ${subscriptionEnd}`
            });
        }

        return res.status(400).json({ message: "Paiement non accepté" });

    } catch (error) {
        console.error("Erreur callback:", error);
        res.status(500).json({ message: "Erreur callback paiement" });
    }
};

module.exports = { createPayment, notifyPayment };

// const { initPayment } = require("../services/payement.service");

// const createPayment = async (req, res) => {
//   try {
//     const { amount, currency, description } = req.body;

//     const paymentData = await initPayment(amount, currency, description);

//     res.json(paymentData); // retourne l’URL au front
//   } catch (err) {
//     console.error("Erreur createPayment:", err.message);
//     res.status(500).json({ error: "Erreur serveur" });
//   }
// };

// module.exports = createPayment;