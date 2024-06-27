const setupProxy = (session) => {
    console.log('proxy request received')
    return session.setProxy({ proxyRules: 'http=127.0.0.1:8000/px/; https=127.0.0.1:8000/px/' });
};

module.exports = setupProxy;
