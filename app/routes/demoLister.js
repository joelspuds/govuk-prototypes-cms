const fs = require('fs-extra');

module.exports = function (router) {

    function loadJSONFromFile (path) {
        const jsonFile = fs.readFileSync(path)
        return JSON.parse(jsonFile)
    }

    /* globals */
    let allDirectors = ["Angela Angles", "Bob Bobbington", "Chris Chrysler", "Diedre Davis"];
    let actionItem;
    let allContent;
    /* INDEX  */

    router.get('/lister', function (request, response) {
        // console.log('loading /lister index');
        let viewData;

        // // console.log(data["GLOBAL_TAG_TITLE_SUFFIX"]);


        /*let bankHolidays = request.session.data;
        // console.log(bankHolidays);*/

        viewData = {
            allDirectors,
            allContent
        }

        response.render('/lister/index', viewData);
    });
    router.post('/lister', function (request, response) {
        const { addAnother } = request.body;

        let redirectURL = '/lister/';

        if (addAnother === 'No') {
            redirectURL = '/lister/done';
        } else if (addAnother === 'Yes') {
            redirectURL = '/lister/add';
        } else if (parseInt(request.body.change) >= 1) {
            actionItem = request.body.change;
            redirectURL = '/lister/change';
        } else if (parseInt(request.body.remove) >= 1) {
            actionItem = request.body.remove;
            allDirectors = allDirectors.filter(item => item !== allDirectors[parseInt(actionItem)-1]);
            redirectURL = '/lister/';
        }

        response.redirect(redirectURL);
    });

    /* ADD  */

    router.get('/lister/add', function (request, response) {
        // console.log('loading /lister add');

        let viewData;
        viewData = {
            allDirectors,
        }

        response.render('/lister/add', viewData);
    });
    router.post('/lister/add', function (request, response) {
        const { newDirector } = request.body;

        allDirectors.push(newDirector);
        let redirectURL = '/lister/';
        response.redirect(redirectURL);
    });

    /* DONE  */

    router.get('/lister/done', function (request, response) {
        // console.log('loading /lister done');
        let viewData;
        viewData = {
            allDirectors,
        }
        response.render('/lister/done', viewData);
    });
    router.post('/lister/done', function (request, response) {
        const {} = request.body;

        let redirectURL = '/lister/';
        response.redirect(redirectURL);
    });

    /* CHANGE  */

    router.get('/lister/change', function (request, response) {
        // console.log('loading /lister change');
        let viewData;
        // console.log('actionItem = ' + actionItem);
        let directorToChange = allDirectors[parseInt(actionItem)-1];

        viewData = {
            allDirectors,
            directorToChange
        }
        response.render('/lister/change', viewData);
    });
    router.post('/lister/change', function (request, response) {
        const {newDirector, changingDirector} = request.body;

        for(let i = 0; i<allDirectors.length; i++) {
            if(allDirectors[i] === changingDirector) {
                allDirectors[i] = newDirector;
            }
        }
        let redirectURL = '/lister/';
        response.redirect(redirectURL);
    });

    /* CONTENT  */

    router.get('/lister/content', function (request, response) {
        // console.log('loading /lister content');
        let viewData;

        allContent = loadJSONFromFile('app/data/content.json')
        // console.log(allContent);

        viewData = {
            allContent,
        }
        response.render('/lister/content', viewData);
    });
    router.post('/lister/change', function (request, response) {
        const {} = request.body;


        let redirectURL = '/lister/content';
        response.redirect(redirectURL);
    });
}
