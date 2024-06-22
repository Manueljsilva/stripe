import stripe 
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .api import get_projects , get_game_info_api

# Create your views here.

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['GET'])
def get_game_info(request, game_id):
    try:
        game_info = get_game_info_api(game_id)
        return JsonResponse(game_info)
    except Exception as e:
        return JsonResponse({"error": str(e)})


@api_view(['POST'])
def create_checkout_session(request):
    game_id = request.data['game_id']
    game_info = get_game_info_api(game_id)

    #crear la sesion de pago
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': game_info['name'],
                    #'images': [game_info['cover']],
                    'description': game_info['summary']
                },
                'unit_amount': 100000,
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url='http://localhost:3000/success',
        cancel_url='http://localhost:3000/cancel',
    )

    return JsonResponse({
        'id': session.id
    })
