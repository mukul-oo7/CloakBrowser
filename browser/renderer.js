// const {ipcRenderer} = require('electron')

document.addEventListener("DOMContentLoaded", () => {
  const webview = document.getElementById("webview");
  const gobackBtn = document.getElementById("goback");
  const goforwardBtn = document.getElementById("goforward");
  const reloadBtn = document.getElementById("reload");
  const homeBtn = document.getElementById("home");
  const addressInput = document.getElementById("addressurl");
  const minimizeBtn = document.getElementById("minimize");
  const maximizeBtn = document.getElementById("maximize");
  const closeBtn = document.getElementById("close");
  
  
  function navigateToUrl(url) {
    console.log('Navigating to:', url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    const proxyUrl = 'http://localhost:8000/proxy/';
    // Check if the URL is already a proxied URL
    if (url.startsWith(proxyUrl)) {
        url = decodeURIComponent(url.slice(proxyUrl.length));
    }
    // Always proxy the URL, even if it's a local URL
    const finalUrl = proxyUrl + encodeURIComponent(url);
    webview.src = finalUrl;
    addressInput.value = url;
}

// Update the event listeners
webview.addEventListener('did-start-loading', () => {
    const currentUrl = webview.src;
    console.log('Loading URL:', currentUrl);
    const proxyUrl = 'http://localhost:8000/proxy/';
    if (currentUrl.startsWith(proxyUrl)) {
        addressInput.value = decodeURIComponent(currentUrl.slice(proxyUrl.length));
    } else {
        addressInput.value = currentUrl;
    }
});

webview.addEventListener('did-navigate', (event) => {
    const currentUrl = event.url;
    console.log('Navigated to:', currentUrl);
    const proxyUrl = 'http://localhost:8000/proxy/';
    if (currentUrl.startsWith(proxyUrl)) {
        addressInput.value = decodeURIComponent(currentUrl.slice(proxyUrl.length));
    } else {
        addressInput.value = currentUrl;
    }
});

webview.addEventListener('will-navigate', (event) => {
    event.preventDefault();
    navigateToUrl(event.url);
});

webview.addEventListener('new-window', (event) => {
    event.preventDefault();
    navigateToUrl(event.url);
});

// window.electron.ipcRenderer.on('uncaught-exception', (message) => {
//     console.error('Uncaught exception in main process:', message);
//     // You can display this error to the user if needed
//   });



  webview.addEventListener("did-fail-load", (event) => {
    console.error(
      "Failed to load:",
      event.errorCode,
      event.errorDescription,
      event.validatedURL
    );
  });

  webview.addEventListener("did-get-response-details", (event) => {
    console.log("Response details:", event.httpResponseCode, event.newURL);
  });

  // addressInput.addEventListener('keydown', (e)=>{
  //     console.log(e.key)
  //     if(e.key == 'Enter'){
  //         let searchedUrl = addressInput.value;

  //         if(searchedUrl.startsWith('https:')){
  //             console.log('https Url entered');
  //             webview.src = searchedUrl
  //         } else{
  //             topDomain = ['.com', '.org', '.in', '.edu', '.gov']

  //             let convertedUrl = https://www.google.com/search?q=${searchedUrl};

  //             for(let i=0; i<topDomain.length; i++){
  //                 if(searchedUrl.endsWith(topDomain[i])){
  //                     convertedUrl = https://www.${searchedUrl};
  //                     break;
  //                 }
  //             }

  //             webview.src = convertedUrl;
  //         }

  //     }
  // });




  addressInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      let searchedUrl = addressInput.value;
      navigateToUrl(searchedUrl);
    }
  });

  gobackBtn.addEventListener("click", () => {
    console.log("GoBack button Hit");
    if (webview.canGoBack()) {
      webview.goBack();
    }
  });

  goforwardBtn.addEventListener("click", () => {
    console.log("GoForward button Hit");
    if (webview.canGoForward()) {
      webview.goForward();
    }
  });

  reloadBtn.addEventListener("click", () => {
    console.log("Reload button hit");
    webview.reload();
  });

  homeBtn.addEventListener("click", () => {
    console.log("Home button Hit");
  });

  webview.addEventListener("did-start-loading", () => {
    addressInput.value = webview.src;
  });

  webview.addEventListener("did-stop-loading", () => {
    addressInput.value = webview.src;
  });

  // ipc codes
  minimizeBtn.addEventListener("click", () => {
    console.log("minimize btn hit");
    window.electron.ipcRenderer.send("minimize-window");
  });

  maximizeBtn.addEventListener("click", () => {
    console.log("maximize btn hit");
    window.electron.ipcRenderer.send("maximize-window");
  });

  closeBtn.addEventListener("click", () => {
    console.log("close window");
    window.electron.ipcRenderer.send("close-window");
  });

  webview.addEventListener("did-fail-load", (event) => {
    console.error("Failed to load:", event.errorDescription);
    // You can display an error message to the user here
  });
});