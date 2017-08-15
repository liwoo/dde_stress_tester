const assert = require('chai').assert
const proxyquire = require('proxyquire')

describe('BulkLoader', () => {
    it('should load fake data into databases given particular parameters', () => {
        const bulk_loader = proxyquire('../lib/bulk_loader', {
            "./dde_db_writer" : function (
                fakeData_npid, 
                fakeData_person, 
                fakeData_elastic, 
                couch_npid_url, 
                couch_person_url,
                elastic_url
            ) { return console.log(`Done Loading to Database on ${couch_npid_url}`) }
        })
        bulk_loader(0, 10, 10, "localhost", "localhost", "localhost")
    });
});
