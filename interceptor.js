const setupInterceptors = (session) => {
    const filter = {
        urls: ['*://*/*'] // Intercept all URLs
    };

    session.webRequest.onBeforeRequest(filter, (details, callback) => {
        console.log('onBeforeRequest:', details);
        callback({ cancel: false }); // Do not cancel the request
    });

    // session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    //     console.log('onBeforeSendHeaders:', details);
    //     callback({ cancel: false });
    // });

    // session.webRequest.onCompleted(filter, (details) => {
    //     console.log('onCompleted:', details);
    // });
};

module.exports = setupInterceptors;
