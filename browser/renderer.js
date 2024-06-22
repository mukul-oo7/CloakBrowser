// const {ipcRenderer} = require('electron')

document.addEventListener('DOMContentLoaded', () => {
    const webview = document.getElementById('webview');
    const gobackBtn = document.getElementById('goback');
    const goforwardBtn = document.getElementById('goforward');
    const reloadBtn = document.getElementById('reload');
    const homeBtn = document.getElementById('home');
    const addressInput = document.getElementById('addressurl');
    const minimizeBtn = document.getElementById('minimize');
    const maximizeBtn = document.getElementById('maximize');
    const closeBtn = document.getElementById('close');

    gobackBtn.addEventListener('click', ()=>{
        console.log('GoBack button Hit');
        if (webview.canGoBack()) {
            webview.goBack();
        }
    });

    goforwardBtn.addEventListener('click', ()=>{
        console.log('GoForward button Hit');
        if(webview.canGoForward()){
            webview.goForward();
        }
    });

    reloadBtn.addEventListener('click', ()=>{
        console.log("Reload button hit")
        webview.reload();
    });

    homeBtn.addEventListener('click', ()=>{
        console.log('Home button Hit');
    });

    addressInput.addEventListener('keydown', (e)=>{
        console.log(e.key)
        if(e.key == 'Enter'){
            let searchedUrl = addressInput.value;

            if(searchedUrl.startsWith('https:')){
                console.log('https Url entered');
                webview.src = searchedUrl
            } else{
                topDomain = ['.com', '.org', '.in', '.edu', '.gov']
                
                let convertedUrl = `https://www.google.com/search?q=${searchedUrl}`;
                
                for(let i=0; i<topDomain.length; i++){
                    if(searchedUrl.endsWith(topDomain[i])){
                        convertedUrl = `https://www.${searchedUrl}`;
                        break;
                    }
                }
                
                webview.src = convertedUrl;
            }

        }
    });

    webview.addEventListener('did-start-loading', () => {
        addressInput.value = webview.src;
    });
    
    webview.addEventListener('did-stop-loading', () => {
        addressInput.value = webview.src;
    });



    // ipc codes
    minimizeBtn.addEventListener('click', ()=>{
        console.log('minimize btn hit');
        window.electron.ipcRenderer.send('minimize-window');
    });

    maximizeBtn.addEventListener('click', ()=>{
        console.log('maximize btn hit');
        window.electron.ipcRenderer.send('maximize-window');
    });

    closeBtn.addEventListener('click', ()=>{
        console.log('close window');
        window.electron.ipcRenderer.send('close-window');
    });

});