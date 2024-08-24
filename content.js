// Function to create the popup
function createPopup(text, x, y) {
  // Remove any existing popup
  let existingPopup = document.getElementById('highlight-popup');
  if (existingPopup) {
      existingPopup.remove();
  }

  // Create a new popup
  let popup = document.createElement('div');
  popup.id = 'highlight-popup';
  
  // Style the popup
  popup.style.position = 'absolute';
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.backgroundColor = '#333';
  popup.style.color = '#fff';
  popup.style.padding = '5px';
  popup.style.borderRadius = '5px';
  popup.style.zIndex = '10000';
  popup.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.5)';
  popup.style.display = "inline"
  
  document.body.appendChild(popup);

  let button = document.createElement('highlight-button');
  button.innerText = 'Search';
  button.style.padding = '5px 10px';
  button.style.backgroundColor = '#007bff';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '3px';
  button.style.cursor = 'pointer';
  button.addEventListener('click', function() {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    window.open(searchUrl, '_blank');
  });

  let conversionText = document.createElement("p");
  conversionText.display = "inline"

  const parsedText = getParsedText(text)
  if (parsedText) {
    conversionText.innerText = parsedText
  } else {
    conversionText.innerText = ""
  }

  popup.appendChild(button)
  popup.appendChild(conversionText)
}

// Listen for mouseup events to detect text selection
document.addEventListener('mouseup', function(event) {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
      // Show the popup at the mouse position
      createPopup(selectedText, event.pageX, event.pageY);
  } else {
    let popup = document.getElementById('highlight-popup');
    if (popup && !popup.contains(event.target)) {
        popup.remove();
    }
  }
});

window.onload = function () {
  const shouldRefresh = shouldRefreshRates();
  
  if (shouldRefresh) {
    console.log("Loading Exchange Rate")
    refreshExchangeRateData()
  } else {
    console.log("Exchange Rate Ready")
  }
}

function refreshExchangeRateData() {
  // apikeys.js binds exchange api key to the window
  fetch("https://v6.exchangerate-api.com/v6/" + window.EXCHANGE_API_KEY + "/latest/AUD")
  .then(response => response.json())
  .then(data => {
      const rate = data.conversion_rates.USD.toString();
      const object = {date: new Date(), audToUsd: rate}
      localStorage.setItem("exchange-rates", JSON.stringify(object))
  })
  .catch(error => console.error('Error:', error));

 
}

function shouldRefreshRates() {
  try {
    const data = localStorage.getItem("exchange-rates")
    const object = JSON.parse(data);
    if (!object.date) throw new Error("No date");
    
    const now = new Date();
    
    return !datesOnSameDays(now, new Date(object.date));
  } catch (err) {
    return true;
  }
}

function datesOnSameDays(date1, date2) {
    // Extract year, month, and day from both dates
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const day1 = date1.getDate();
    
    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();
    
    // Compare year, month, and day
    return year1 === year2 && month1 === month2 && day1 === day2;
}

function getParsedText(highlightedText) {
  if (highlightedText[0] === "$") {
    return getConversionText(highlightedText)
  }
  return undefined;
}

function getConversionText(highlightedText) {
  try {
    const dollarValue = Number(highlightedText.slice(1))
    if (Number.isNaN(dollarValue)) return undefined;
    const data = localStorage.getItem("exchange-rates")
    if (!data) return undefined;
    const object = JSON.parse(data);
    if (!object.audToUsd) return undefined;

    const audDollars = dollarValue / object.audToUsd;

    return dollarValue.toFixed(2) + " USD -> " + audDollars.toFixed(2) + " AUD";
  } catch (err) {
    return undefined
  }
}
