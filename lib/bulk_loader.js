const dde_generator = require('./dde_generator');
const db_writer = require('./dde_db_writer');

module.exports = function loader(start, end, chunks, couch_npid_url, couch_person_url, elastic_url) {
    for (let i = start; i < end; i++) {
        const fakeData = dde_generator(i, chunks);
        db_writer(fakeData.npid, fakeData.person, fakeData.elastic, couch_npid_url, couch_person_url, elastic_url);
    }
};