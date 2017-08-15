//@flow
const dde_generator = require('./dde_generator')
const db_writer = require('./dde_db_writer')

module.exports = function loader(
    start: number, 
    end: number,
    chunks: number,
    couch_npid_url: string,
    couch_person_url: string,
    elastic_url: string) : void {
    for(let i=start; i<end; i++) {
        const fakeData = dde_generator(i, chunks)
        db_writer(
            fakeData.npid, 
            fakeData.person, 
            fakeData.elastic, 
            couch_npid_url, 
            couch_person_url,
            elastic_url 
        )
    }
}