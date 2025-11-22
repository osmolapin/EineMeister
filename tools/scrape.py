'''Scraper to find products/product info from Selver.ee'''
import requests, re
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from typing import List


def productInfo(product_slug: str) -> dict[str, str]:
    """
    Find all the information from product slug

    :param product_slug: Extracted from the product url i.e 'suitsujuust-18-tere-200-g'
    :return: Dictionary of all the product info needed for the database.
    """

    cookies = {
        'CookieConsent': '{stamp:%27Oym0p8pLdbwpS6O6MnBYoiW5eJm1rNHt4yoTHPrA9ln6CGJGE+P7tg==%27%2Cnecessary:true%2Cpreferences:false%2Cstatistics:false%2Cmarketing:false%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1759244688403%2Cregion:%27ee%27}',
        '_upscope__region': 'ImV1LWNlbnRyYWwi',
        '_upscope__shortId': 'IllQUEdNTkU1MUNaSEtOR0VRIg==',
    }

    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': f'https://www.selver.ee/{product_slug}',
        'content-type': 'application/json',
    }

    params = {
        'from': '0',
        'request': json.dumps({
            "query": {
                "bool": {
                    "filter": {
                        "terms": {
                            "url_path": [product_slug]
                        }
                    }
                }
            }
        }),
        'size': '50',
        'sort': '',
    }

    # Make api request
    response = requests.get(
        'https://www.selver.ee/api/catalog/vue_storefront_catalog_et/product/_search',
        params=params,
        cookies=cookies,
        headers=headers,
    )

    data = response.json()
    product = data["hits"]["hits"][0]["_source"]


    # Extract product data
    name = product.get("name")
    weight = product.get("product_volume")
    description = clean_html(product.get("description")) or "Tühjus"
    storage = product.get("product_storage_cond_use") or "Tühjus"
    ingredients = clean_html(product.get("product_ingrediens")) or "Tühjus"
    price_with_tax = round(float(product.get("price_incl_tax")), 2)

    # Nutrition (may be missing)
    calories = product.get("product_nutr_energy")
    if calories:
        calories = re.findall(r"\d+",calories.split("/")[1])[0]
        
    nutrition = {
        "calories": calories or 0,
        "fats": product.get("product_nutr_fats") or 0,
        "carbs": product.get("product_nutr_carbohydrates") or 0,
        "proteins": product.get("product_nutr_proteins") or 0
    }

    # Image URL
    image_path = product.get("image")
    image_url = f"https://www.selver.ee/media/catalog/product{image_path}"
    image_name = image_path.split("/")[-1]


    # Download image
    def download_image(url, filename="product.jpg"):
        r = requests.get(url)
        if r.status_code == 200:
            with open(filename, "wb") as f:
                f.write(r.content)
            print(f"-Image saved as {filename}")
        else:
            print("-Could not download image: ", r.status_code)


    download_image(image_url, image_name)

    product_info = {"name": name, "weight": weight, "price": price_with_tax, 
            "description": description, "storing": storage, "imageUrl": "/images/" + image_name, "ingredients": ingredients}

    for k, v in nutrition.items():
        product_info[k] = v

    return product_info


def extractProductLinks(url: str) -> List[str]:
    """
    Uses Selenium to load dynamic content, then Beautiful Soup to extract 
    the hrefs from <a> tags with the class 'ProductCard__link'.

    :param url: The URL of the webpage to scrape.
    :return: A list of the found href links.
    """
    product_links = []
    
    # Setup Selenium Options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    
    # You might need to specify the path to your chromedriver executable if it's not in your PATH
    # e.g., driver = webdriver.Chrome(options=chrome_options, service=Service('/path/to/chromedriver'))
    driver = webdriver.Chrome(options=chrome_options)

    try:
        print(f"Loading dynamic content from: {url}...")
        driver.get(url)

        # Wait up to 10 seconds until at least one element with the class is found
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'ProductCard__link'))
        )
        
        # Get the fully rendered HTML content
        html_content = driver.page_source
        
        # Use Beautiful Soup to parse the rendered HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find and extract the hrefs
        product_elements = soup.find_all('a', class_='ProductCard__link')
        
        print(f"Found {len(product_elements)} product links.")
        
        for element in product_elements:
            href = element.get('href')
            if href and href[1::] not in product_links:
                product_links.append(href[1::])
                
    except Exception as e:
        print(f"An error occurred during scraping: {e}")
        
    finally:
        driver.quit()
        
    return product_links

def clean_html(raw_html: str) -> str:
    if raw_html:
        return BeautifulSoup(raw_html, "html.parser").get_text(separator=" ").strip()
    return "Tühjus"