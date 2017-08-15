//@flow
const Client = require('node-rest-client').Client
const settings = require('../settings.json')
const _ = require('lodash')
const faker = require('faker')
const async = require('async')
const client = new Client() 
const couch_header = settings.couchHeader
const elastic_header = settings.elasticHeader

module.exports = function dde_db_writer(
    npid_fakeData: Array<any>, 
    person_fakeData: Array<any>, 
    elastic_fakeData: Array<any>, 
    couch_npid_url: string, 
    couch_person_url: string,
    elastic_url: string) : void {
        let npid_args = {
            "data" : {
                "docs" : npid_fakeData
            },
            "headers" : couch_header
        }

        let person_args = {
            "data" : {
                "docs" : person_fakeData
            },
            "headers" : couch_header
        }

        let elastic_args = {
            "data" : elastic_fakeData,
            "headers" : elastic_header
        }
        const couch_npid = () => { client.post(couch_npid_url, npid_args, (data) => { console.log("Done loading into " + couch_npid_url) }) }
        const couch_person = () => { client.post(couch_person_url, person_args, (data) => { console.log("Done loading into " + couch_person_url) }) }
        const elastic = () => { client.post(elastic_url, elastic_args, (data) => { console.log("Done loading into " + elastic_url) }) }

        console.log("Started Bulk Posting...")
        async.parallel([couch_npid, couch_person, elastic], (err, results) => {
            if (err) {
                console.error(err)
            }

            console.log("Finished Bulk Posting...")
            console.log(results.toString())
        })
    }
