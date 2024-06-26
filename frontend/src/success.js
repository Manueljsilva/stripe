import { useEffect , useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";


const SuccessPage = () => {
    const location = useLocation();
    const [transaction, setTransaction] = useState(null);
    const [amount , setAmount] = useState(0);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get("session_id");

        const fetchSession  = async (sessionId) => {
            try {
                const { data } = await axios.get(`/payments/checkout_session/${sessionId}/`);
                setTransaction(data);
                setAmount(data.amount_total / 100); // Stripe amounts are in cents
            } catch (error) {
                console.log("Error fetching transaction", error);
            }
        };
        if (sessionId) {
            fetchSession(sessionId);
        }

    }, [location.search]);
    return (
        <div>
            <h1>Gracias por tu compra</h1>
            <p>El pago se realizó exitosamente</p>
            <p>Monto: ${amount}</p>
            <p>Id de la transacción: {transaction?.id}</p>
        </div>
    );
}

export default SuccessPage;