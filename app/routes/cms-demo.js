// const path = require('path');
// const fs = require('fs-extra')
// const contentFolderPath = 'app/data/content';
// let validateDate = require("validate-date");
let allContent;

//const myModule = require('./cms/config');
//let connectionDetails = myModule.JSONConnectionDetails();
// console.log(connectionDetails);

function getThePageContent() {
    /*var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-collection-access-token", connectionDetails.myJSONAccessToken);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            allContent = '';
            for(let i = 0; i < result.data.length; i++)  {
                if (i === (result.data.length - 1)) {
                    allContent += '"' + result.data[i].name + '": "' + result.data[i].value + '"';
                } else {
                    allContent += '"' + result.data[i].name + '": "' + result.data[i].value + '",';
                }
            }
            allContent = "{" + allContent + "}";
            allContent = JSON.parse(allContent);
        }
        )
        .catch(
            error => console.log('error', error
            )
        );

    console.log(allContent);*/
}

// getThePageContent();
// function myFunction() {
//     console.log('Hello data!');
// }
// setTimeout(myFunction, 500);


module.exports = function (router) {

    const getTheData = require('./cms/getStuff');
    let allContent = getTheData.getJSONData();
    console.log('allTheData : : : : : : : : : ');
    console.log(allContent);

    /* globals */
    let version = "demo";
    let allData = [];

    /* INDEX Start page  */
    router.get(`/${version}`, function (request, response) {
        let viewData;
        // getThePageContent();
        let allContent = getTheData.getJSONData();

        console.log('allContent from inside route function : : : : : : : : : ');
        console.log(allContent);

        viewData = {
            allData,
            allContent
        };

        response.render(`/${version}/index`, viewData);
    });

    router.post(`/${version}`, function (request, response) {
        const {} = request.body;
        let redirectURL = `/${version}/input`;
        response.redirect(redirectURL);
    });

    /* INPUT  */
    router.get(`/${version}/input`, function (request, response) {
        let viewData;
        getThePageContent();

        viewData = {
            allData,
            allContent
        };

        response.render(`/${version}/input`, viewData);
    });

    router.post(`/${version}`, function (request, response) {
        const { inputOne} = request.body;
        request.session.inputOne = inputOne;
        let redirectURL = `/${version}/finish`;
        response.redirect(redirectURL);
    });

    /* FINISH  */
    router.get(`/${version}/finish`, function (request, response) {
        let viewData;
        getThePageContent();

        allData.output = request.session.inputOne;
        viewData = {
            allData,
            allContent
        };

        response.render(`/${version}/finish`, viewData);
    });

}
