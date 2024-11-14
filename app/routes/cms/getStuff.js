module.exports = {
    getJSONData: function() {

        console.log('starting external function');

        let allContent;

        const connections = require('./config');
        let connectionDetails = connections.JSONConnectionDetails();
        console.log('connectionDetails : : : : : : : ');
        console.log(connectionDetails);

        function getThePageContent() {
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
                        allContent = '';
                        for (let i = 0; i < result.data.length; i++) {
                            if (i === (result.data.length - 1)) {
                                allContent += '"' + result.data[i].name + '": "' + result.data[i].value + '"';
                            } else {
                                allContent += '"' + result.data[i].name + '": "' + result.data[i].value + '",';
                            }
                        }
                        allContent = "{" + allContent + "}";
                        allContent = JSON.parse(allContent);
                        console.log('allContent from inner function : : : : : :');
                        console.log(allContent);
                        return (allContent);
                    }
                )
                .catch(
                    error => console.log('error', error
                    )
                );

            console.log(allContent);

            // let allData = 'testing allData';
            /*let testWord = 'Hello';
            return  {
                allContent,
                testWord
            };*/
        }


        getThePageContent();

    }
}
