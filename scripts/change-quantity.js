function changeProductQuantity(type) {
    let numElement = document.getElementById("quantity-number");
    let priceElement = document.getElementById("product-price")
    let numValue = Number(numElement.textContent);
    let priceValue = Number(priceElement.textContent.replace(' €', ''));
    let unitPrice = priceValue/numValue;



    if (type == 1) {
    numValue++;

    } else if (type == -1) {
    if (numValue > 1) {
        numValue--;
    } else {
        return;
    }
    }

    numElement.innerText = numValue;
    priceElement.innerText = (unitPrice * numValue).toFixed(2) + " €";
}