import requests 
from django.http import JsonResponse
from datetime import datetime


def get_projects(body , path):
    url = "https://api.igdb.com/v4/" + path 
    headers = {
        "Client-ID": "c06lhch62fquhdp2j5xgz6kfgj2d6r",
        "Authorization": "Bearer liwqrh0zbo9ggub1crmwo4yo2jw82s",
        "Accept": "application/json"
    }

    response = requests.post(url, headers=headers , data=body)
    try:
        return response
    except requests.exceptions.HTTPError as e:
        return JsonResponse({"error": str(e)})
    
def get_game_info_api(id):
    fields = "fields summary, name, first_release_date, genres.name, platforms.name, involved_companies.company.name, cover.image_id;"
    body = fields + " where id = " + str(id) + ";"
    data = get_projects(body, "games").json()[0]
    try:
        return {
            'api_id': id,
            'name': data["name"],
            'release_year': datetime.utcfromtimestamp(data["first_release_date"]).strftime('%d-%m-%Y'),
            'genres': [i["name"] for i in data["genres"]],
            'platforms': [i["name"] for i in data["platforms"]],
            'summary': data["summary"],
            'involved_companies': [i["company"]["name"] for i in data["involved_companies"]],
            'cover': "https://images.igdb.com/igdb/image/upload/t_1080p/" + data["cover"]["image_id"] + ".jpg",
        }
    except:
        return JsonResponse({"error": "Game not found"})
    



#    <Elements stripe={stripePromise}>
#       <CheckoutForm />
#  </Elements>