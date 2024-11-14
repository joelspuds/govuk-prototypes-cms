//const path = require('path');
//const fs = require('fs-extra')
// const directoryPath = path.join(__dirname, 'Documents');
//const contentFolderPath = 'app/data/content';

module.exports = function (router) {

    const myModule = require('./config');
    let connectionDetails = myModule.JSONConnectionDetails();
    // console.log(connectionDetails);

    /*function loadJSONFromFile (path) {
        const jsonFile = fs.readFileSync(path)
        return JSON.parse(jsonFile)
    }*/

    function addLeadingZero(numberToCheck) {
        numberToCheck = numberToCheck.toString();
        let returnValue;
        if (numberToCheck.length === 1) {
            returnValue = '0' + numberToCheck;
        } else {
            returnValue = numberToCheck;
        }
        return returnValue;
    }

    /* unique array */
    function uniq(a) {
        var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];
        return a.filter(function(item) {
            var type = typeof item;
            if(type in prims)
                return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
            else
                return objs.indexOf(item) >= 0 ? false : objs.push(item);
        });
    }

    /* globals */
    let allData = [];
    // let fileList = [];

    /* INDEX LIST  */
    router.get('/content-manager/', function (request, response) {
        let viewData;
        let allContent;

        /* Edit item */
        if(request.session.itemHasBeenEdited === true && request.session.nameOfEditedItem !== '') {
            allData.itemHasBeenEdited = true;
            allData.nameOfEditedItem = request.session.nameOfEditedItem;
        } else {
            allData.itemHasBeenEdited = null;
            allData.itemHasBeenEdited = null;
        }
        request.session.itemHasBeenEdited = false;
        request.session.nameOfEditedItem = null;

        /* Add item*/
        if(request.session.itemHasBeenAdded === true && request.session.nameOfAddedItem !== '') {
            allData.itemHasBeenAdded = true;
            allData.nameOfAddedItem = request.session.nameOfAddedItem;
        } else {
            allData.itemHasBeenAdded = null;
            allData.nameOfAddedItem = null;
        }
        request.session.itemHasBeenAdded = false;
        request.session.nameOfAddedItem = null;

        /* Delete item */
        if(request.session.itemHasBeenDeleted === true && request.session.nameOfDeletedItem !== '') {
            allData.itemHasBeenDeleted = true;
            allData.nameOfDeletedItem = request.session.nameOfDeletedItem;
        } else {
            allData.itemHasBeenDeleted = null;
            allData.nameOfDeletedItem = null;
        }
        request.session.itemHasBeenDeleted = false;
        request.session.nameOfDeletedItem = null;

        let allPageTypes = [];

        var myHeaders = new Headers();
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
                allContent = result.data
                allData.dataForDeletion = result.data;

                for(let i = 0; i < allContent.length; i++) {
                    allPageTypes.push(allContent[i].page);
                }

                let uniquePagesArray = uniq(allPageTypes);

                viewData = {
                    uniquePagesArray,
                    allContent,
                    allData
                }
                response.render('/content-manager/list', viewData);
                }
            )
            .catch(
                error => console.log('error', error
            )
        );
    });

    router.post('/content-manager', function (request, response) {
        const { editButton, removeButton } = request.body;

        let actionItem;
        let redirectURL;

        if(parseInt(editButton) >= 1){
            allData.action = 'edit';
            allData.actionItem = parseInt(editButton) - 1;
        }
        if(parseInt(removeButton) >= 1){
            allData.action = 'remove';
            allData.actionItem = parseInt(removeButton) - 1;
        }

        if (allData.action === 'edit') {
            redirectURL = '/content-manager/edit';
            response.redirect(redirectURL);

        } else if (allData.action === 'remove') {

            let tempDeletedName = allData.dataForDeletion[allData.actionItem].name;
            allData.dataForDeletion.splice(allData.actionItem, 1);

            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("x-collection-access-token", `${connectionDetails.myJSONAccessToken}`);

            var urlencoded = new URLSearchParams();
            urlencoded.append("jsonData", JSON.stringify(allData.dataForDeletion));

            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
            };

            fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    request.session.itemHasBeenDeleted = true;
                    request.session.nameOfDeletedItem = tempDeletedName;
                    redirectURL = '/content-manager';
                    response.redirect(redirectURL);
                })
                .catch(error => console.log('error', error));
        }

    });

    /* EDIT  */

    router.get('/content-manager/edit', function (request, response) {
        let viewData;

        let itemToShow = allData.actionItem;
        let allContent;
        let singleItem;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-collection-access-token", `${connectionDetails.myJSONAccessToken}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                singleItem = result.data[itemToShow];
                allContent = result.data;
                allData.tempJSON = result.data;

                console.log('allContent FRESH');
                console.log(allContent);
                viewData = {
                    allContent,
                    allData,
                    singleItem
                }
                response.render('/content-manager/edit', viewData);
            }
        )
        .catch(
            error => console.log('error', error
            )
        );
    });

    router.post('/content-manager/edit', function (request, response) {
        const { name, page, value } = request.body;

        const d = new Date();
        console.log(d);
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        let seconds = Date.now();
        const monthShort = d.toLocaleString('default', { month: 'short' });


        let allContent = allData.tempJSON;
        let itemToChange = allData.actionItem;

        allContent[parseInt(itemToChange)].name = (name) ? name : 'defined';
        allContent[parseInt(itemToChange)].page = (page) ? page : '—';
        allContent[parseInt(itemToChange)].value = (value) ? value : '[Placeholder: ' + name + ' ]';
        allContent[parseInt(itemToChange)].updatedDay = addLeadingZero(day);
        allContent[parseInt(itemToChange)].updatedMonth = monthShort;
        allContent[parseInt(itemToChange)].updatedYear = year;
        allContent[parseInt(itemToChange)].updatedSeconds = seconds;
        allData.newJSON = allContent;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("x-collection-access-token", `${connectionDetails.myJSONAccessToken}`);

        var urlencoded = new URLSearchParams();
        urlencoded.append("jsonData", JSON.stringify(allData.newJSON));

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                let redirectURL = '/content-manager';
                request.session.itemHasBeenEdited = true;
                request.session.nameOfEditedItem = name;
                response.redirect(redirectURL);
            })
            .catch(error => console.log('error', error));
    });

    /* ADD  */

    router.get('/content-manager/add', function (request, response) {
        let viewData;
        // let allContentForAddition;

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-collection-access-token", `${connectionDetails.myJSONAccessToken}`);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                    allData.allContentForAddition = result.data;
                    viewData = {
                        allData
                    }
                    response.render('/content-manager/add', viewData);
                }
            )
            .catch(
                error => console.log('error', error
                )
            );
    });

    router.post('/content-manager/add', function (request, response) {
        const { name, page, value } = request.body;

        const d = new Date();
        console.log(d);
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let year = d.getFullYear();
        let seconds = Date.now();
        const monthShort = d.toLocaleString('default', { month: 'short' });

        let tempData = allData.allContentForAddition;

        let tempPage = page;
        if(tempPage === '' || tempPage === null) {
            tempPage = '—';
        }
        let tempValue = value;
        if(tempValue === '' || tempValue === null) {
            tempValue = '[Placeholder: ' + name + ' ]';
        }

        tempData.push({
            "name": name,
            "page": tempPage,
            "value": tempValue,
            "updatedDay": addLeadingZero(day),
            "updatedMonth": monthShort,
            "updatedYear": year,
            "updatedSeconds": seconds
        });

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("x-collection-access-token", `${connectionDetails.myJSONAccessToken}`);

        var urlencoded = new URLSearchParams();
        urlencoded.append("jsonData", JSON.stringify(tempData));

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch(`https://api.myjson.online/v1/records/${connectionDetails.myJSONurlID}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result);
                request.session.itemHasBeenAdded = true;
                request.session.nameOfAddedItem = name;

                let redirectURL = '/content-manager';
                response.redirect(redirectURL);
            })
            .catch(error => console.log('error', error));
    });
}
