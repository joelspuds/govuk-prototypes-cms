//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();
require('./routes/cms/contentManager')(router);

require('./routes/genericRoutes')(router);
require('./routes/cms-demo')(router);

