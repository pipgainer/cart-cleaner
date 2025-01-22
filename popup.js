let isDeleting = false;

document.getElementById("clearCartBtn").addEventListener("click", () => {
    checkCartPage((platform) => {
        isDeleting = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: deleteCartItems,
                args: [platform]
            });
        });
    });
});

document.getElementById("clearSavedForLaterBtn").addEventListener("click", () => {
    checkCartPage((platform) => {
        isDeleting = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: deleteSavedForLaterItems,
                args: [platform]
            });
        });
    });
});

document.getElementById("stopBtn").addEventListener("click", () => {
    checkCartPage(() => {
        isDeleting = false;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: stopDeletion
            });
        });
    });
});

function checkCartPage(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        if (url.includes("https://www.amazon.") && (url.includes("/gp/cart/view.html") || url.includes("/cart?"))) {
            callback("amazon");
        } else if (url.includes("https://www.flipkart.com/viewcart")) {
            callback("flipkart");
        } else {
            alert("You are not on a supported cart page. Please go to Amazon or Flipkart cart page.");
        }
    });
}

function deleteCartItems(platform) {
    window.isDeleting = true;

    if (platform === "amazon") {
        function deleteAllAmazonCartItems() {
            function deleteItems() {
                if (!window.isDeleting) return;

                const activeCartDiv = document.querySelector('#sc-active-cart');
                const deleteButtons = activeCartDiv ? activeCartDiv.querySelectorAll('[value="Delete"]') : [];

                if (deleteButtons.length > 0) {
                    deleteButtons.forEach(button => button.click());
                    setTimeout(deleteItems, 500);
                } else {
                    alert("All Amazon cart items deleted.");
                }
            }
            deleteItems();
        }
        deleteAllAmazonCartItems();

    } else if (platform === "flipkart") {
        function deleteAllFlipkartCartItems() {
            function deleteItems() {
                if (!window.isDeleting) return;

                // Select the 'Remove' buttons for cart items
                const removeButtons = Array.from(document.querySelectorAll('div.sBxzFz'))
                    .filter(div => div.textContent.trim() === "Remove");

                // Check for "Save for Later" option in the same parent div
                const itemsToDelete = removeButtons.filter(button => {
                    const parentDiv = button.parentElement; // Get the parent div
                    return parentDiv && Array.from(parentDiv.children)
                        .some(child => child.textContent.trim() === "Save for later"); // Check for "Save for later" among siblings
                });

                if (itemsToDelete.length > 0) {
                    // Click on each remove button
                    itemsToDelete.forEach(button => {
                        button.click(); // Click to remove the item

                        // Wait for the modal to appear and click the confirm button
                        setTimeout(() => {
                            const confirmButton = Array.from(document.querySelectorAll('div.sBxzFz'))
                                .find(div => div.textContent.trim() === "Remove"); // Find the 'Remove' text in the modal
                            if (confirmButton) {
                                confirmButton.click(); // Click the 'Remove' text in the modal
                            }
                        }, 500); // Adjust the timeout as necessary to wait for the modal to appear
                    });

                    setTimeout(deleteItems, 1000); // Recheck after a delay to account for modal interactions
                } else {
                    alert("All Flipkart cart items deleted.");
                }
            }
            deleteItems();
        }
        deleteAllFlipkartCartItems();
    }
}

function deleteSavedForLaterItems(platform) {
    if (platform === "amazon") {
        window.isDeleting = true;

        function deleteAllAmazonSavedForLaterItems() {
            function deleteItems() {
                if (!window.isDeleting) return;

                const savedForLaterDiv = document.querySelector('#sc-secondary-list');
                const deleteButtons = savedForLaterDiv ? savedForLaterDiv.querySelectorAll('[value="Delete"]') : [];

                if (deleteButtons.length > 0) {
                    deleteButtons.forEach(button => button.click());
                    setTimeout(deleteItems, 500);
                } else {
                    alert("All 'Saved for Later' items deleted on Amazon.");
                }
            }
            deleteItems();
        }
        deleteAllAmazonSavedForLaterItems();
    } else if (platform === "flipkart") {
        function deleteAllFlipkartSavedForLaterItems() {
            function deleteItems() {
                if (!window.isDeleting) return;

                // Select the 'Remove' buttons for cart items
                const removeButtons = Array.from(document.querySelectorAll('div.sBxzFz'))
                    .filter(div => div.textContent.trim() === "Remove");

                // Check for "Save for Later" option in the same parent div
                const itemsToDelete = removeButtons.filter(button => {
                    const parentDiv = button.parentElement; // Get the parent div
                    return parentDiv && Array.from(parentDiv.children)
                        .some(child => child.textContent.trim() === "Move to cart"); // Check for "Save for later" among siblings
                });

                if (itemsToDelete.length > 0) {
                    // Click on each remove button
                    itemsToDelete.forEach(button => {
                        button.click(); // Click to remove the item

                        // Wait for the modal to appear and click the confirm button
                        setTimeout(() => {
                            const confirmButton = Array.from(document.querySelectorAll('div.sBxzFz'))
                                .find(div => div.textContent.trim() === "Remove"); // Find the 'Remove' text in the modal
                            if (confirmButton) {
                                confirmButton.click(); // Click the 'Remove' text in the modal
                            }
                        }, 500); // Adjust the timeout as necessary to wait for the modal to appear
                    });

                    setTimeout(deleteItems, 1000); // Recheck after a delay to account for modal interactions
                } else {
                    alert("All 'Saved for Later' items deleted on Flipkart.");
                }
            }
            deleteItems();
        }
        deleteAllFlipkartSavedForLaterItems();
    }
}

function stopDeletion() {
    window.isDeleting = false;
    alert("Deletion stopped.");
}
