const npid = require('./national_patient_id_lite')
const casual = require('casual')
const Client = require('node-rest-client').Client
const _ = require('lodash')
const faker = require('faker')
const async = require('async') 
const jq = require('node-jq')

const ip = process.args[2]
const couch_port = '5984'
const elastic_port = '9200'
const target_site_code = process.args[3]
const site_code = _.first(_.shuffle(["KCH","MPC","A18","A25"])).toLowerCase()
const person_db = 'dde_person_' + target_site_code
const npid_db = 'dde_' + target_site_code
const couch_person_url = `http://${ip}:${couch_port}/${person_db}/_bulk_docs`
const couch_npid_url = `http://${ip}:${couch_port}/${npid_db}/_bulk_docs`
const elastic_url = `http://${ip}:${elastic_port}/_bulk`

const client = new Client()
const couch_header = { "Content-Type" : "application/json" }
const elastic_header = { "Content-Type" : "application/x-ndjson" }
const elastic_bulk_data = []

let npid_args = {
    "data" : {
        "docs" : []
    },
    "headers" : couch_header
}

let person_args = {
    "data" : {
        "docs" : []
    },
    "headers" : couch_header
}

let elastic_args = {
    "data" : [],
    "headers" : elastic_header
}

for (let i = 0; i<100000; i++) {
    const id = npid.init(i+1)
    const region = _.first(_.shuffle(["Centre","South","North"]))
    const birthdate_estimate = 0;
    const birthdate = casual.date(format = 'YYYY-MM-DD')

    const npid_data = {
        "_id" : String(i+1),
        "date_created" : Date.now(),
        "national_id": id,
        "assigned": true,
        "region": region,
        "site_code": site_code,
        "type": "Npid"
    }
    npid_args["data"]["docs"].push(npid_data)

    const person_data = {
        "_id" : id,
        "address" : {
            "current_residence" : casual.street,
            "current_village" : casual.street,
            "current_ta" : casual.city,
            "current_district" : casual.state,
            "home_village" : casual.street,
            "home_ta" : casual.city,
            "home_district" : casual.state,
        },
        "attributes" : {
            "occupation" : faker.name.jobTitle(),
            "cell_phone_number" : casual.phone
        },
        "birthdate" : birthdate,
        "birthdate_estimated": birthdate_estimate,
        "created_at": Date.now(),
        "gender" : _.first(_.shuffle(["F", "M"])),
        "names" : {
            "family_name" : casual.last_name,
            "given_name" : casual.first_name,
            "middle_name" : _.first(_.shuffle([casual.first_name, null]))
        },
        "site_code" : site_code,
        "type" : "Person"
    }
    person_args["data"]["docs"].push(person_data)
    
    const footprint_data = {
        "application" : _.first(_.shuffle(['art', 'anc', 'opd', 'hts'])),
        "created_at" : Date.now(),
        "npid" : id,
        "temp_id" : i+1,
        "origin" : site_code,
        "site_code" : site_code,
        "type" : "Footprint",
        "updated_at" : Date.now()
    }
    person_args["data"]["docs"].push(footprint_data)

    /******************* ELASTIC SEARCH STUFF HERE *****************/
    const elastic_npid_index = {
        "index" : {
            "_index" : "dde",
            "_type" : "npids",
            "_id" : i+1
        }
    }

     const elastic_person_index = {
        "index" : {
            "_index" : "dde",
            "_type" : "person",
            "_id" : id
        }
    }

     const elastic_footprint_index = {
        "index" : {
            "_index" : "dde",
            "_type" : "footprint",
            "_id" : i+1
        }
    }
    
    const elastic_npid_data = _.omit(npid_data, ['_id'])
    const elastic_person_data = _.omit(person_data, ['_id'])
    const elastic_footprint_data = _.omit(footprint_data, ['_id'])

    elastic_bulk_data.push(JSON.stringify(elastic_npid_index))
    elastic_bulk_data.push(JSON.stringify(elastic_npid_data))
   
    elastic_bulk_data.push(JSON.stringify(elastic_footprint_index))
    elastic_bulk_data.push(JSON.stringify(elastic_footprint_data))
    
    elastic_bulk_data.push(JSON.stringify(elastic_person_index))
    elastic_bulk_data.push(JSON.stringify(elastic_person_data))

    console.log("Done Populating " + (i+1) + " of 100,000")
}

elastic_args['data'].push(elastic_bulk_data.join('\n')+'\n')

const couch_npid = () => { client.post(couch_npid_url, npid_args, (data) => { console.log("Done loading into " + couch_npid_url) }) }
const couch_person = () => { client.post(couch_person_url, person_args, (data) => { console.log("Done loading into " + couch_person) }) }
const elastic = () => { client.post(elastic_url, elastic_args, (data) => { console.log("Done loading into " + elastic_url) }) }

console.log("Started Bulk Posting...")
async.parallel([couch_npid, couch_person, elastic], (err, results) => {
    if (err) {
        console.error(err)
    }

    console.log("Finished Bulk Posting...")
    console.log(results.toString())
})

