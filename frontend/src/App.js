import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import SuccessPage from "./success";

axios.defaults.baseURL = "http://127.0.0.1:8000";

const stripePromise = loadStripe(
  "pk_test_51PTrkxAV9C8AH0FjomTzbGrgU6UrA9RHmxpAH1XdrGRZRoV2D5dl0Laoyl344YRymWaqRPVftFMwZuEAMbl8KU7B00XpCKZOVk"
);

const CheckoutForm = ({ cart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    try {
      const { data } = await axios.post("/payments/create_checkout_session/", {
        games: cart.map((game) => ({
          game_id: game.api_id,
          quantity: game.quantity,
        })),
      });

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (stripeError) {
        setErrorMessage(stripeError.message);
      }
    } catch (error) {
      setErrorMessage("Error al procesar el pago");
      console.log("Error al procesar el pago", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {cart && cart.length > 0 && cart.map((game) => (
        <div key={game.api_id}>
          <img src={game.cover} alt={game.name} width={200} />
          <h2>{game.name}</h2>
          <p>{game.summary}</p>
          <p>Precio: ${game.price}</p>
          <p>Cantidad: {game.quantity}</p>
        </div>
      ))}
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [cart, setCart] = useState([]);

  const fetchGameInfo = async (gameId) => {
    try {
      const { data } = await axios.get(`/payments/game/${gameId}/`);
      setSelectedGame(data);
    } catch (error) {
      console.log("Error al obtener la información del juego", error);
    }
  };

  const addToCart = (game) => {
    setCart([...cart, { ...game, quantity: 1, price: 100 }]); // Precio de ejemplo
  };
  return (
    <Router>
      <div>
        <h1>Comprar Juego</h1>
        <Routes>
          <Route exact path="/" element={ <>
            <p>Selecciona un juego para comprar</p>
            <p>
              <button onClick={() => fetchGameInfo(1)}>Comprar Thief 1</button>
            </p>
            <p>
              <button onClick={() => fetchGameInfo(11642)}>Comprar Geometry Dash</button>
            </p>
            <p>
              <button onClick={() => fetchGameInfo(126459)}>Comprar Valorant</button>
            </p>
            {selectedGame && (
              <div>
                <h2>{selectedGame.name}</h2>
                <button onClick={() => addToCart(selectedGame)}>Agregar al Carrito</button>
              </div>
            )}
            {cart.length > 0 && (
              <Elements stripe={stripePromise}>
                <CheckoutForm cart={cart} />
              </Elements>
            )}</>
          } />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
