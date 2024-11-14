module.exports = function (router) {

    /* INDEX root */
    router.get('/', function (request, response) {
        // console.log('loading root index');
        let viewData;
        viewData = {};
        response.render('index', viewData);
    });
}
