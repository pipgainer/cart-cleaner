chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "clearCart") {
        removeAllItemsFromCart();
    }
});

function removeAllItemsFromCart() {
    // Look for all the delete buttons in the cart and click them
    const deleteButtons = document.querySelectorAll('[value="Delete"]');
    deleteButtons.forEach(button => button.click());
}
