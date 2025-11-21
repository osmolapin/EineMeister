import requests
import json
import os

def productInfo(PRODUCT_SLUG):

    cookies = {
        'CookieConsent': '{stamp:%27Oym0p8pLdbwpS6O6MnBYoiW5eJm1rNHt4yoTHPrA9ln6CGJGE+P7tg==%27%2Cnecessary:true%2Cpreferences:false%2Cstatistics:false%2Cmarketing:false%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1759244688403%2Cregion:%27ee%27}',
        '_upscope__region': 'ImV1LWNlbnRyYWwi',
        '_upscope__shortId': 'IllQUEdNTkU1MUNaSEtOR0VRIg==',
    }

    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': f'https://www.selver.ee/{PRODUCT_SLUG}',
        'content-type': 'application/json',
    }

    params = {
        'from': '0',
        'request': json.dumps({
            "query": {
                "bool": {
                    "filter": {
                        "terms": {
                            "url_path": [PRODUCT_SLUG]
                        }
                    }
                }
            }
        }),
        'size': '50',
        'sort': '',
    }


    # ---------------------------
    # MAKE API REQUEST
    # ---------------------------
    response = requests.get(
        'https://www.selver.ee/api/catalog/vue_storefront_catalog_et/product/_search',
        params=params,
        cookies=cookies,
        headers=headers,
    )

    data = response.json()
    product = data["hits"]["hits"][0]["_source"]

    # ---------------------------
    # EXTRACT PRODUCT DATA
    # ---------------------------
    name = product.get("name")
    weight = product.get("product_volume")
    description = product.get("description")
    storage = product.get("product_storage_cond_use")
    price_with_tax = product.get("price_incl_tax")  # ✔ final price with tax

    # Nutrition (may be missing)
    nutrition = {
        "calories": product.get("product_nutr_energy"),
        "fats": product.get("product_nutr_fats"),
        "carbs": product.get("product_nutr_carbohydrates"),
        "proteins": product.get("product_nutr_proteins"),
    }

    # Image URL
    image_path = product.get("image")
    image_url = f"https://www.selver.ee/media/catalog/product{image_path}"
    image_name = image_path.split("/")[-1]


    # ---------------------------
    # DOWNLOAD IMAGE
    # ---------------------------
    def download_image(url, filename="product.jpg"):
        r = requests.get(url)
        if r.status_code == 200:
            with open(filename, "wb") as f:
                f.write(r.content)
            print(f"[✔] Image saved as {filename}")
        else:
            print("[!] Could not download image:", r.status_code)


    download_image(image_url, image_name)


    # ---------------------------
    # SHOW RESULT
    # ---------------------------
    product_info = {"name": name, "weight": name, "price": price_with_tax, 
            "description": description, "storing": storage, "image_url": image_name}
    
    # print("\n-------- PRODUCT INFO --------")
    # print("Name:", name)
    # print("Weight:", weight)
    # print("Price (incl tax):", price_with_tax, "€")
    # print("Description:", description)
    # print("Storage:", storage)

    # print("\n--- Nutrition (per 100g) ---")
    for k, v in nutrition.items():
        product_info[k] = v
    #     print(f"{k}: {v}")

    return product_info
