'''Main program to scrape from Selver.ee'''
from scrape import productInfo, extractProductLinks
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('C:/Users/osmol/Desktop/einemeister-84e8c-9ecf3578e1f7.json')
app = firebase_admin.initialize_app(cred)
db = firestore.client()

clear = lambda: os.system("cls")
product_types = ["liha", "piimatoode", "oli", "puuvili", "juurvili", "kuivaine", "kulmutatud", "maiustus", "muna"]


while True:
    clear()
    product_type = ""

    url = input("Sisesta selveri lehekülg: ")

    while product_type not in product_types:
        product_type = input("Sisesta toodete ühtne tüüp (liha, piimatoode, oli, puuvili, juurvili, kuivaine, kulmutatud, maiustus, muna): ")

    product_slugs = extractProductLinks(url)

    for product in product_slugs:
        product_data = productInfo(product)

        product_data["type"] = product_type

        doc_ref = db.collection("products").document()
        doc_ref.set(product_data)

        print(f"{product_data["name"]} lisatud andmebaasi!")
