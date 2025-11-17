function changeProductQuantity(type) {
    let numElement = document.getElementById("quantity-number");
    let priceElement = document.getElementById("product-price");
    let numValue = Number(numElement.textContent);
    let priceValue = Number(priceElement.textContent.replace(' €', ''));
    let unitPrice = priceValue / numValue;

    if (type === 1) {
        numValue++;
    } else if (type === -1 && numValue > 1) {
        numValue--;
    }


    numElement.textContent = numValue;
    priceElement.textContent = (unitPrice * numValue).toFixed(2) + " €";
}