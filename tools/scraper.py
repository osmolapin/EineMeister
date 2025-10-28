from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import requests
import os

def get_product_data(url, class_name):
    # Configure Chrome (headless)
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Launch driver
    driver = webdriver.Chrome(service=Service(), options=chrome_options)

    print(f"Fetching {url} ...")
    driver.get(url)
    time.sleep(3)  # wait for JS to load

    try:
        elements = driver.find_elements(By.CLASS_NAME, class_name)
        if not elements:
            print(f"No elements found with class '{class_name}'")
        else:
            for i, el in enumerate(elements, 1):
                # If the element is an image, get src
                if el.tag_name == "img":
                    img_url = el.get_attribute("src")

                    # Optional: download the image
                    os.makedirs("images", exist_ok=True)
                    image_name = os.path.basename(img_url.split("?")[0])
                    image_path = os.path.join("images", image_name)
                    data.append("/" + image_path)

                    try:
                        response = requests.get(img_url)
                        if response.status_code == 200:
                            with open(image_path, "wb") as f:
                                f.write(response.content)
                        else:
                            print(f"Failed to download (status {response.status_code})")
                    except Exception as e:
                        print(f"Error downloading image: {e}")

                # Otherwise, get text content
                else:
                    text = el.text.strip()
                    if text:
                        data.append(text)
    except Exception as e:
        print("Error:", e)

    finally:
        driver.quit()


# Example usage:
if __name__ == "__main__":
    url = "https://www.selver.ee/rapsioli-olivia-olivia-500-ml"
    data = []
    get_product_data(url, "ProductPrice")
    get_product_data(url, "ProductName")
    get_product_data(url, "AttributeAccordion__content")
    get_product_data(url, "product-image__thumb")

    print(data)
    print("db.collection(\"products\").add({name: \""+ data[1] + "\", description: \"" + data[2] + "\", imageUrl: \""+ data[3] +"\", price: \""+ data[0] +"\", calories: \"\", carbs: \"\", fats: \"\", proteins: \"\", ingredients: \"\", storing: \"\", weight: \"\"})")
