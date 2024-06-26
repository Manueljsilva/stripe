import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .api import get_projects, get_game_info_api

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['GET'])
def get_game_info(request, game_id):
    try:
        game_info = get_game_info_api(game_id)
        return JsonResponse(game_info)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# este endpoint es para crear una sesión de pago en Stripe
@api_view(['POST'])
def create_checkout_session(request):
    try:
        games = request.data['games']
        line_items = []

        for game in games:
            game_info = get_game_info_api(game['game_id'])
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': game_info['name'],
                        'description': game_info['summary']
                    },
                    'unit_amount': game_info.get('price', 100000),  # Assuming a default price
                },
                'quantity': game['quantity'],
            })

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/cancel',
        )

        return JsonResponse({'id': session.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

#este endpoint devuelve la informacion de la transaccion
@api_view(['GET'])
def get_checkout_session(request, session_id):
    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        return JsonResponse(checkout_session)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)