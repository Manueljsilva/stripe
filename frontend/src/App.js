import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000";

const stripePromise = loadStripe(
  "pk_test_51PTrkxAV9C8AH0FjomTzbGrgU6UrA9RHmxpAH1XdrGRZRoV2D5dl0Laoyl344YRymWaqRPVftFMwZuEAMbl8KU7B00XpCKZOVk"
);

const CheckoutForm = ({ game }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errormessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    try {
      const { data } = await axios.post("/payments/create_checkout_session/", {
        game_id: game.api_id,
      });
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (stripeError) {
        console.log(stripeError);
      }
    } catch (error) {
      setErrorMessage("Error al procesar el pago");
      console.log("Error al procesar el pago", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <img src={game.cover} alt={game.name} width={500} />
      <h2>{game.name}</h2>
      <p>{game.summary}</p>
      <p>Precio: 100$</p>
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
      {errormessage && <p>{errormessage}</p>}
    </form>
  );
};

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchGameInfo = async (gameId) => {
    try {
      const { data } = await axios.get(`/payments/game/${gameId}/`);
      setSelectedGame(data);
    } catch (error) {
      console.log("Error al obtener la informacion del juego", error);
    }
  };

  return (
    <div>
      <h1>Comprar Juego</h1>
      <p>Selecciona un juego para comprar</p>
      <p>
        {" "}
        <button onClick={() => fetchGameInfo(1)}>Comprar thief 1</button>{" "}
      </p>
      <p>
        {" "}
        <button onClick={() => fetchGameInfo(11642)}>
          Comprar Geometry Dash
        </button>{" "}
      </p>
      <p>
        {" "}
        <button onClick={() => fetchGameInfo(126459)}>
          Comprar Valorant
        </button>{" "}
      </p>
      {selectedGame && (
        <Elements stripe={stripePromise}>
          <CheckoutForm game={selectedGame} />
        </Elements>
      )}
    </div>
  );
}

export default App;
