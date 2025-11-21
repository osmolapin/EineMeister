from scrape import productInfo
import os
from firebase import firebase
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate('C:/Users/osmol/Desktop/einemeister-84e8c-9ecf3578e1f7.json')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

clear = lambda: os.system("cls")
product_types = ["liha", "piimatooted", "olid", "puuviljad", "juurviljad", "kuivained", "kulmutatud", "maiustused"]

def printLine():
    print("-" * 40)

while True:
    clear()
    product_type = ""

    printLine()
    slug = input("Sisesta toote slug: ")
    printLine()

    product_data = productInfo(slug)

    while product_type not in product_types:
        product_type = input("Sisesta toote tüüp (liha, piimatooted, õlid, puuviljad, juurviljad, kuivained, kylmutatud, maiustused): ")
    product_data["type"] = product_type

    doc_ref = db.collection("products").document()
    doc_ref.set(product_data)
    print("Toode lisatud andmebaasi!")
